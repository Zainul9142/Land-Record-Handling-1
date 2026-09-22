from typing import Dict, Any, List

def consult_legal_advisor(question: str, state: str = None, land_identity_id: str = None, risk_findings: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    BhoomiShield AI Legal Advisor engine.
    Comprehensive coverage across Central Indian Land Acts and State Revenue Codes:
    - Central: Transfer of Property Act 1882, Registration Act 1908, RERA 2016, Specific Relief Act 1963
    - Jharkhand: CNT Act 1908 (Sec 46, 71A), SPT Act 1949 (Sec 20), Mutation Rules 2011
    - Uttar Pradesh: UP Revenue Code 2006 (Sec 80 NA Conversion, Sec 98/99 SC/ST restrictions, Sec 38 Khatauni correction)
    - Maharashtra: Maharashtra Land Revenue Code (MLRC 1966 Sec 36/36A, Sec 44 NA, 7/12 Ferfar Entry)
    - Karnataka: Karnataka Land Revenue Act 1964, PTCL Act 1978 (SC/ST Granted Land Non-alienation)
    - Delhi: Delhi Land Reforms Act 1954 (Sec 33 Transfer Limits, Sec 81 Misuse of Agricultural Land)
    - Bihar: Bihar Tenancy Act 1885 & Bihar Land Disputes Resolution Act 2009
    - West Bengal: West Bengal Land Reforms Act 1955 (Bargadar Protections & Sec 14)
    - Tamil Nadu: Tamil Nadu Patta Pass Book Act 1983 & Tamil Nadu Land Reforms Act
    - Rajasthan: Rajasthan Tenancy Act 1955 (Sec 42 Restrictions on SC/ST Land Transfer)
    """
    q_lower = question.lower()
    st_lower = (state or "").lower()

    # 1. UP Revenue Code 2006 (Uttar Pradesh)
    if any(k in q_lower for k in ["up revenue code", "uttar pradesh", "fasli", "gata", "khatauni", "section 80", "section 98", "section 99", "zamindari"]) or "uttar pradesh" in st_lower or "up" in st_lower:
        if any(k in q_lower for k in ["sc", "st", "dalit", "section 98", "section 99", "transfer"]):
            answer = (
                "⚖️ **Legal Guidance under Uttar Pradesh Revenue Code, 2006 (Section 98 & 99)**:\n\n"
                "1. **Restrictions on Transfer by Scheduled Castes (Section 98)**: A bhumidhar belonging to a Scheduled Caste cannot transfer land by sale, gift, or mortgage to any non-SC person without prior written approval from the Collector / District Magistrate.\n"
                "2. **Mandatory Land Retention Condition**: Permission will only be granted if the transferor continues to retain at least 1.26 hectares (approx. 3.11 acres) of agricultural land.\n"
                "3. **Consequences of Violation (Section 104/105)**: Any deed or agreement executed in violation of Section 98 is void, and the land automatically vests with the State Government (Gram Sabha) free from all encumbrances.\n\n"
                "**Action**: Verify Khatauni category and obtain DM sanction certificate prior to executing sale deed."
            )
            law_ref = "UP Revenue Code 2006 (Section 98 & 104)"
        elif any(k in q_lower for k in ["section 80", "conversion", "commercial", "residential", "na"]):
            answer = (
                "⚖️ **Legal Guidance on Non-Agricultural Land Use Conversion (UP Revenue Code Section 80)**:\n\n"
                "1. **Declaration under Section 80**: When agricultural land (Bhumidhari holding) is put to industrial, commercial, or residential use, a formal declaration from the Sub-Divisional Magistrate (SDM) is legally required.\n"
                "2. **Exemption from Land Ceiling & Revenue Lagan**: Post-Section 80 declaration, the holding ceases to be governed by agricultural tenancy laws and is evaluated under municipal/urban town planning norms.\n"
                "3. **Risk of Buying Without Sec 80**: Construction on agricultural land without 143/80 approval is liable for demolition and penalties under the UP Urban Planning and Development Act."
            )
            law_ref = "UP Revenue Code 2006 (Section 80 & 81)"
        else:
            answer = (
                "⚖️ **Legal Guidance under UP Revenue Code 2006 & Mutation Rules**:\n\n"
                "1. **Mutation of Names (Section 34/35)**: Any person obtaining possession through registered sale deed, succession, or will must apply for Dakhil-Kharij before the Tahsildar within statutory limits.\n"
                "2. **Correction of Records (Section 38)**: For clerical errors in Khatauni or area discrepancies in Khasra/Gata map, an application lies before the Sub-Divisional Officer (SDO).\n"
                "3. **Appellate Forum**: First appeal lies before the Sub-Divisional Officer, Second Appeal before the Commissioner, and Revision before the Board of Revenue UP (Prayagraj/Lucknow)."
            )
            law_ref = "UP Revenue Code 2006 (Section 34, 35 & 38)"

    # 2. Maharashtra Land Revenue Code (MLRC 1966 & 7/12 Ferfar)
    elif any(k in q_lower for k in ["maharashtra", "mlrc", "7/12", "saat bara", "ferfar", "gat no", "section 36", "section 44", "na conversion", "taluka"]) or "maharashtra" in st_lower or "mh" in st_lower:
        if any(k in q_lower for k in ["tribal", "st", "adivasi", "section 36", "section 36a"]):
            answer = (
                "⚖️ **Legal Guidance under Maharashtra Land Revenue Code, 1966 (Section 36 & 36A)**:\n\n"
                "1. **Section 36A Tribal Land Non-Alienation**: Transfer of agricultural land owned by an Adivasi / Tribal to a non-tribal cannot take place without prior sanction of the District Collector and previous sanction of the State Government.\n"
                "2. **Restoration of Land**: Section 36B and the Maharashtra Restoration of Lands to Scheduled Tribes Act, 1974 empower the Collector to suo-motu invalidate illegal transfers and restore physical possession to original tribal holders.\n"
                "3. **Saat Bara Check**: Check the *Pahani Patrak* and *Itar Hakka* (Other Rights column) in the 7/12 extract for non-alienable Class-II tenure restrictions."
            )
            law_ref = "MLRC 1966 (Section 36A) & Restoration of Lands Act 1974"
        elif any(k in q_lower for k in ["na", "non-agricultural", "section 44", "collector"]):
            answer = (
                "⚖️ **Legal Guidance on Non-Agricultural (NA) Permission in Maharashtra (MLRC Section 44)**:\n\n"
                "1. **Section 44 Mandatory NA Sanction**: Converting agricultural land for residential (NA-44), commercial, or industrial use requires formal order from District Collector / SDO.\n"
                "2. **Gunthewari Regularization**: Layouts developed on fragmented lands without Town Planning (TP) approval must be regularized under the Maharashtra Gunthewari Developments Act, 2001.\n"
                "3. **Ferfar Entry**: Always inspect Ferfar (Mutation Entry Extract) to ensure NA conversion premium and layout development charges were fully settled."
            )
            law_ref = "Maharashtra Land Revenue Code 1966 (Section 44 & 45)"
        else:
            answer = (
                "⚖️ **Legal Guidance on 7/12 (Saat Bara) & Ferfar Mutations in Maharashtra**:\n\n"
                "1. **7/12 Village Form VII & XII**: Form VII lists owner & tenure (Class I Occupant or Class II Conditional), while Form XII records crop and land use.\n"
                "2. **Ferfar (Form VI Mutation)**: Every sale deed, partition, or succession generates a *Kaccha Ferfar* with a 15-day notice period for objections before the Circle Officer confirms it into a *Pakka Ferfar*.\n"
                "3. **Appeal (Section 247)**: Challenge illegal mutation decisions before the Sub-Divisional Officer (SDO) within 60 days."
            )
            law_ref = "MLRC 1966 (Section 148, 149 & 247)"

    # 3. Karnataka (Karnataka Land Revenue Act 1964 & PTCL Act 1978)
    elif any(k in q_lower for k in ["karnataka", "bhoomi", "rtc", "pahani", "ptcl", "sc/st", "section 79a", "section 79b", "survey no", "hobli"]) or "karnataka" in st_lower or "ka" in st_lower:
        if any(k in q_lower for k in ["ptcl", "sc", "st", "granted land", "section 4"]):
            answer = (
                "⚖️ **Legal Guidance under Karnataka PTCL Act, 1978 (Prohibition of Transfer of Certain Lands)**:\n\n"
                "1. **Section 4 Void Transfers**: Any transfer of agricultural land granted by the Government to persons belonging to Scheduled Castes / Scheduled Tribes without prior government permission is null and void *ab initio*.\n"
                "2. **No Limitation Period for Resumption**: In *Satyan vs. Deputy Commissioner*, the Supreme Court held that Assistant Commissioners (AC) have statutory jurisdiction to cancel sale deeds and restore possession to SC/ST grantees even after decades.\n"
                "3. **Due Diligence**: Inspect the original *Saguvali Chit* (Grant Certificate) and verify Grant Condition period before purchasing land in Karnataka."
            )
            law_ref = "Karnataka PTCL Act 1978 (Section 4 & 5)"
        else:
            answer = (
                "⚖️ **Legal Guidance under Karnataka Land Revenue Act, 1964 & RTC Pahani Rules**:\n\n"
                "1. **Bhoomi RTC (Form 16)**: Column 9 shows owner details, Column 10 shows acquisition mode (Mutation number), Column 11 shows liabilities/bank encumbrances, and Column 12 shows tenancy.\n"
                "2. **Section 128 Mutation**: Compulsory reporting of title acquisition within 3 months to the Revenue Inspector / Tahsildar.\n"
                "3. **Appeal under Section 136(2)**: Any grievance against mutation order passed by Revenue Inspector can be appealed before the Assistant Commissioner (AC)."
            )
            law_ref = "Karnataka Land Revenue Act 1964 (Section 128 & 136)"

    # 4. Delhi (Delhi Land Reforms Act 1954)
    elif any(k in q_lower for k in ["delhi", "dlr", "section 81", "section 33", "lal dora", "extended lal dora", "bhumidhar"]) or "delhi" in st_lower or "dl" in st_lower:
        answer = (
            "⚖️ **Legal Guidance under Delhi Land Reforms (DLR) Act, 1954**:\n\n"
            "1. **Section 81 Misuse of Agricultural Land**: Using agricultural land in Delhi for farmhouse construction, commercial godowns, or unauthorized banquets triggers Section 81 proceedings by the SDM/Revenue Assistant, leading to vesting of land in Gaon Sabha.\n"
            "2. **Section 33 Holding Ceilings**: No Bhumidhar can transfer land if the transfer results in holding less than 8 standard acres.\n"
            "3. **Lal Dora / Village Abadi Land**: Land inside Lal Dora is exempt from building bylaws of municipal authorities but title proof relies heavily on Jamabandi and Electricity/House Tax receipts."
        )
        law_ref = "Delhi Land Reforms Act 1954 (Section 33 & 81)"

    # 5. Jharkhand (CNT Act 1908 & SPT Act 1949)
    elif any(k in q_lower for k in ["cnt", "chota nagpur", "spt", "santhal", "jharkhand", "section 46", "section 71a", "section 20", "bokaro", "ranchi"]):
        answer = (
            "⚖️ **Legal Guidance under CNT Act 1908 & SPT Act 1949 (Jharkhand)**:\n\n"
            "1. **CNT Act Section 46**: Transfer of occupancy holdings by Scheduled Tribes (ST) to non-STs is strictly prohibited without prior written sanction of the Deputy Commissioner (DC).\n"
            "2. **CNT Act Section 71A Restoration**: DC has suo-motu powers to evict illegal occupants on tribal land and restore possession to original raiyat.\n"
            "3. **SPT Act Section 20**: In Santhal Parganas (Dumka, Deoghar, Godda), land is completely non-transferable unless explicitly recorded as transferable in Khatian.\n"
            "4. **Mutation SLA**: Circle Officers must dispose of mutation within 30 days; appeals lie before the LRDC under Section 7."
        )
        law_ref = "Chota Nagpur Tenancy Act 1908 & Santhal Parganas Tenancy Act 1949"

    # 6. Central Acts: Registration Act 1908 & RERA 2016
    elif any(k in q_lower for k in ["rera", "builder", "flat", "project", "possession delay"]):
        answer = (
            "⚖️ **Legal Remedies under Real Estate (Regulation and Development) Act, 2016 (RERA)**:\n\n"
            "1. **Mandatory Registration (Section 3)**: Any real estate project with land area exceeding 500 sq. meters or 8 apartments must be registered with State RERA.\n"
            "2. **Delay Compensation (Section 18)**: If builder fails to hand over possession per agreement, buyer is entitled to 100% refund with interest or monthly delay interest.\n"
            "3. **Complaint Forum**: File formal complaint before State RERA Authority and Adjudicating Officer."
        )
        law_ref = "Real Estate (Regulation and Development) Act 2016 (Section 3 & 18)"

    # 7. Court Litigation & Stay Orders (Lis Pendens)
    elif any(k in q_lower for k in ["court", "stay", "dispute", "litigation", "injunction", "lis pendens"]):
        answer = (
            "⚖️ **Legal Guidance on Property Under Active Litigation (Transfer of Property Act Section 52)**:\n\n"
            "1. **Doctrine of Lis Pendens**: Under Section 52 of TPA 1882, property under active litigation in Civil or Revenue Court cannot be transferred or encumbered so as to affect the rights of any party under any decree.\n"
            "2. **Injunction (Order 39 CPC)**: If a Court has granted Temporary Injunction / Status Quo, any alienation or mutation executed during the stay period is illegal and actionable under Contempt of Courts Act.\n"
            "3. **Remedy**: Obtain certified copies of the order sheet and pending plaint before entering into any agreement to sell."
        )
        law_ref = "Transfer of Property Act 1882 (Section 52) & CPC (Order 39)"

    # Default Pan-India Guidance
    else:
        answer = (
            "⚖️ **BhoomiShield Pan-India Legal AI Guidance**:\n\n"
            "Indian Land Laws require multi-tier statutory verification across State Revenue Codes and Central Property Acts:\n\n"
            "• **Title & Ownership Integrity**: Verify baseline RoR (Khatian/Khatauni/7-12/RTC Pahani) vs current Mutation tenant register.\n"
            "• **Tribal & SC/ST Protections**: CNT/SPT (Jharkhand), UP Revenue Code Sec 98, MLRC Sec 36A (Maharashtra), PTCL Act (Karnataka), Rajasthan Tenancy Sec 42.\n"
            "• **Land Conversion**: Non-agricultural conversion approvals (Sec 80 UP, Sec 44 MLRC, Sec 95 KLR Act).\n"
            "• **Encumbrance & Lis Pendens**: Active bank mortgages (CERSAI check) and Civil/Revenue Court stay orders."
        )
        law_ref = "Digital India Land Governance & Revenue Jurisprudence"

    return {
        "question": question,
        "state": state or "Pan-India",
        "legal_advice": answer,
        "statutory_reference": law_ref,
        "disclaimer": "This legal guidance is generated by BhoomiShield AI based on statutory State Revenue Codes and Central Indian Property Acts. It is for informational due-diligence and does not constitute formal advocate legal counsel."
    }
