import re
from typing import List, Tuple
from pydantic import BaseModel, Field


class DeterministicRuleResult(BaseModel):
    flags: List[str] = Field(default_factory=list)
    heuristic_score: int = Field(default=0, ge=0, le=100)
    extracted_urls: List[str] = Field(default_factory=list)
    detected_suspicious_keywords: List[str] = Field(default_factory=list)


def sanitize_untrusted_input(text: str, max_length: int = 1000) -> str:
    """
    Sanitize untrusted user-submitted message:
    - Strips null bytes and non-printable control characters.
    - Neutralizes XML/tag escape attempts (e.g. </untrusted_user_message>).
    - Enforces max length restriction.
    """
    if not text:
        return ""
    
    # Strip non-printable/control chars except whitespace
    cleaned = "".join(ch for ch in text if ch == "\n" or ch == "\t" or (32 <= ord(ch) <= 126) or ord(ch) > 127)
    
    # Neutralize prompt injection delimiter breakouts
    cleaned = cleaned.replace("</untrusted_user_message>", "[escaped-tag]")
    cleaned = cleaned.replace("<untrusted_user_message>", "[escaped-tag]")
    
    # Enforce strict length cap
    return cleaned.strip()[:max_length]


# Heuristic patterns
SUSPICIOUS_TLDS = r"\.(apk|top|xyz|vip|fit|work|cn|ru|cc|tk|ml|ga|cf|gq|club|online|site)\b"
URL_PATTERN = re.compile(r"https?://[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(?:com|in|org|net|co|biz)/[^\s]*", re.IGNORECASE)
RAW_IP_URL = re.compile(r"https?://(?:\d{1,3}\.){3}\d{1,3}", re.IGNORECASE)
SHORTENER_PATTERN = re.compile(r"(bit\.ly|tinyurl\.com|t\.me|is\.gd|cutt\.ly|rb\.gy|wa\.me)/[a-zA-Z0-9_-]+", re.IGNORECASE)
BANK_SPOOF_DOMAIN = re.compile(r"(sbi|hdfc|icici|axis|pnb|paytm|phonepe|gpay)[-_.]?(kyc|update|login|support|refund|apk)", re.IGNORECASE)

CREDENTIAL_HARVEST_KEYWORDS = [
    (r"\b(otp|one time password)\b", "Requests OTP (Banks never ask for OTP)"),
    (r"\b(upi\s*pin|atm\s*pin|mpin)\b", "Prompts for UPI PIN or MPIN"),
    (r"\b(cvv|card expiry|card number)\b", "Requests sensitive card CVV or details"),
    (r"\b(netbanking password|login password)\b", "Requests banking password"),
]

URGENCY_THREAT_KEYWORDS = [
    (r"\b(immediately|within\s*\d+\s*(hours?|hrs?|mins?)|today\s*itself)\b", "Manufactured artificial urgency"),
    (r"\b(account\s*(blocked|suspended|deactivated|frozen))\b", "Threatens immediate account block"),
    (r"\b(electricity|power|bijli)\s*(cut|disconnect|disconnected|blackout)\b", "Threat of electricity disconnection"),
    (r"\b(sim\s*(blocked|disabled|deactivated)|kyc\s*expired)\b", "Threat of SIM or KYC deactivation"),
    (r"\b(police|fir|arrest|legal action|court)\b", "Legal intimidation / arrest threat"),
]

REMOTE_ACCESS_APPS = [
    (r"\b(anydesk|teamviewer|quicksupport|rustdesk|airdroid)\b", "Demands installation of remote screen-sharing software"),
]

REFUND_COLLECT_TRAPS = [
    (r"\b(galti\s*se\s*(bhej|dal)|wrongly\s*credited|mistakenly\s*transferred|please\s*refund)\b", "Classic 'Wrong UPI Transfer' social engineering trap"),
    (r"\b(enter\s*pin\s*to\s*receive|click\s*pay\s*to\s*accept|collect\s*request)\b", "Deceptive UPI collect request (entering PIN debits your account)"),
]


def run_deterministic_rule_checks(text: str) -> DeterministicRuleResult:
    """
    Executes fast, deterministic heuristic checks on Indian financial message text.
    Returns detected flags and an initial heuristic risk score (0-100).
    """
    flags: List[str] = []
    suspicious_keywords: List[str] = []
    extracted_urls: List[str] = []
    score = 0

    lower_text = text.lower()

    # 1. URL Analysis
    found_urls = URL_PATTERN.findall(text)
    extracted_urls.extend(found_urls)

    if RAW_IP_URL.search(text):
        flags.append("Suspicious raw IP address link detected instead of official domain.")
        score += 35

    if re.search(SUSPICIOUS_TLDS, text, re.IGNORECASE):
        flags.append("Suspicious or risky top-level domain (.apk, .top, .xyz, etc.) detected.")
        score += 30

    if SHORTENER_PATTERN.search(text):
        flags.append("Obfuscated shortened URL (bit.ly, tinyurl, etc.) hiding true destination.")
        score += 25

    if BANK_SPOOF_DOMAIN.search(text):
        flags.append("Lookalike bank/wallet phishing domain pattern detected.")
        score += 40

    # 2. Sensitive credential requests
    for pattern, desc in CREDENTIAL_HARVEST_KEYWORDS:
        if re.search(pattern, lower_text):
            flags.append(desc)
            suspicious_keywords.append(pattern)
            score += 40

    # 3. Urgency and threats
    for pattern, desc in URGENCY_THREAT_KEYWORDS:
        if re.search(pattern, lower_text):
            flags.append(desc)
            suspicious_keywords.append(pattern)
            score += 25

    # 4. Remote access software
    for pattern, desc in REMOTE_ACCESS_APPS:
        if re.search(pattern, lower_text):
            flags.append(desc)
            suspicious_keywords.append(pattern)
            score += 45

    # 5. Refund and UPI collect traps
    for pattern, desc in REFUND_COLLECT_TRAPS:
        if re.search(pattern, lower_text):
            flags.append(desc)
            suspicious_keywords.append(pattern)
            score += 35

    # 6. Personal 10-digit mobile number claiming banking action
    if re.search(r"\b[6-9]\d{9}\b", text) and re.search(r"\b(sbi|hdfc|bank|account|kyc|electricity)\b", lower_text):
        flags.append("Private 10-digit mobile number used for official institutional notification.")
        score += 20

    # Cap score at 100
    capped_score = min(score, 100)

    return DeterministicRuleResult(
        flags=flags,
        heuristic_score=capped_score,
        extracted_urls=extracted_urls,
        detected_suspicious_keywords=suspicious_keywords,
    )
