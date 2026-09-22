import random
import json
import sqlite3
import datetime
from pathlib import Path
from app.db.database import get_db_connection, init_db
from app.engine.normalization import generate_land_identity_id, STATE_CODES

# Comprehensive Pan-India State & District Data Hierarchy
PAN_INDIA_DATA = {
    "Jharkhand": {
        "portal": "Jharbhoomi / JharBhuNaksha",
        "subdistrict_name": "Anchal",
        "primary_no_name": "Khata No (खाता सं.)",
        "plot_no_name": "Khesra No (खेसरा सं.)",
        "record_type": "Sabik Khatian & Register-II",
        "districts": {
            "Bokaro": {"subdistricts": {"Chas": ["Kura", "Bandhdih", "Kamas", "Tupkadih", "Pundru"], "Bermo": ["Phusro", "Bermo Khas", "Jarangdih", "Durgapur"]}},
            "Ranchi": {"subdistricts": {"Kanke": ["Boreya", "Sangkura", "Arsande", "Pithoria"], "Ormanjhi": ["Dudri", "Irba", "Gagari", "Anandi"]}},
            "Dhanbad": {"subdistricts": {"Jharia": ["Bhaga", "Tisra", "Jharia Khas", "Lodna"], "Govindpur": ["Govindpur Khas", "Khartanga", "Asanboni"]}},
            "East Singhbhum": {"subdistricts": {"Jamshedpur": ["Kadma", "Sonari", "Jugsalai", "Mango"], "Ghatshila": ["Ghatshila Khas", "Dhalbhumgarh", "Mouhanda"]}},
            "Hazaribagh": {"subdistricts": {"Sadar": ["Pelawal", "Demotand", "Matwari", "Korrah"], "Ichak": ["Ichak Khas", "Gobardar", "Kura"]}},
            "Deoghar": {"subdistricts": {"Deoghar Sadar": ["Jasidih", "Rohini", "Kunda", "Baidyanathpur"], "Madhupur": ["Madhupur Khas", "Bhedwa", "Paharipur"]}},
            "Palamu": {"subdistricts": {"Medininagar": ["Daltonganj", "Chianki", "Singra", "Shahpur"], "Hussainabad": ["Japla", "Deori", "Kusumha"]}},
            "Giridih": {"subdistricts": {"Giridih Sadar": ["Bhandaridih", "Makatpur", "Sirsiya"], "Dumri": ["Dumri Khas", "Isri", "Nimiaghat"]}}
        }
    },
    "Uttar Pradesh": {
        "portal": "UP Bhulekh / BorUP / Real-time Khatauni",
        "subdistrict_name": "Tehsil",
        "primary_no_name": "Gata / Khatauni No (गाटा/खतौनी)",
        "plot_no_name": "Khasra No (खसरा सं.)",
        "record_type": "Khatauni (ROR) & Fasli Record",
        "districts": {
            "Gautam Buddha Nagar (Noida)": {"subdistricts": {"Dadri": ["Bhangel", "Surajpur", "Chhapraula", "Tilapta"], "Sadar Noida": ["Sector 62", "Atta", "Mamura", "Barola"], "Jewar": ["Jewar Bangar", "Rohi", "Dayanatpur"]}},
            "Lucknow": {"subdistricts": {"Sarojini Nagar": ["Amausi", "Banthra", "Hindnagar", "Transport Nagar"], "Bakshi Ka Talab": ["Itaunja", "Bhaisamau", "Asta"], "Lucknow Sadar": ["Alambagh", "Gomti Nagar", "Mahanagar"]}},
            "Varanasi": {"subdistricts": {"Varanasi Sadar": ["Shivpur", "Pandeypur", "Sarnath", "Ramnagar"], "Pindra": ["Phoolpur", "Pindra Khas", "Sindhora"]}},
            "Kanpur Nagar": {"subdistricts": {"Kanpur Sadar": ["Kalyanpur", "Govind Nagar", "Panki", "Rawatpur"], "Ghatampur": ["Ghatampur Khas", "Bhitargaon", "Sajeti"]}},
            "Prayagraj": {"subdistricts": {"Sadar": ["Civil Lines", "Naini", "Jhunsi", "Phaphamau"], "Phulpur": ["Phulpur Khas", "Sahson", "Andawa"]}},
            "Agra": {"subdistricts": {"Agra Sadar": ["Dayalbagh", "Tajganj", "Bodla", "Kamla Nagar"], "Fatehabad": ["Fatehabad Khas", "Doki", "Shamshabad"]}},
            "Ghaziabad": {"subdistricts": {"Ghaziabad Sadar": ["Sahibabad", "Raj Nagar", "Muradnagar"], "Modinagar": ["Modinagar Khas", "Bhojpur", "Niwari"]}},
            "Meerut": {"subdistricts": {"Meerut Sadar": ["Kankerkhera", "Partapur", "Daurala"], "Mawana": ["Mawana Khas", "Hastinapur", "Parikshitgarh"]}},
            "Gorakhpur": {"subdistricts": {"Gorakhpur Sadar": ["Pipraich", "Bargadwa", "Medical College"], "Sahjanwa": ["Sahjanwa Khas", "Ghaghar", "Rithia"]}},
            "Bareilly": {"subdistricts": {"Bareilly Sadar": ["CB Ganj", "Izzatnagar", "Rithora"], "Aonla": ["Aonla Khas", "Sirauli", "Ramnagar"]}}
        }
    },
    "Maharashtra": {
        "portal": "Mahabhulekh / 7/12 (Saat Bara) / 8A / Ferfar",
        "subdistrict_name": "Taluka",
        "primary_no_name": "Gat No / Khata No (गट क्र.)",
        "plot_no_name": "Survey No / Hissa (सर्व्हे क्र.)",
        "record_type": "7/12 Extract (Saat Bara) & Ferfar",
        "districts": {
            "Pune": {"subdistricts": {"Haveli": ["Wakad", "Hinjawadi", "Baner", "Hadapsar", "Kharadi"], "Mulshi": ["Pirangut", "Paud", "Bhugaon", "Lavale"], "Khed": ["Chakan", "Alandi", "Rajgurunagar"]}},
            "Mumbai Suburban": {"subdistricts": {"Andheri": ["Versova", "Marol", "Vile Parle", "Juhu"], "Kurla": ["Ghatkopar", "Chembur", "Trombay"], "Borivali": ["Kandivali", "Malad", "Dahisar"]}},
            "Thane": {"subdistricts": {"Thane": ["Naupada", "Ghodbunder", "Kopri", "Majiwada"], "Kalyan": ["Dombivli", "Titwala", "Kalyan West"], "Mira Bhayandar": ["Mira Road", "Bhayandar East", "Uttan"]}},
            "Nagpur": {"subdistricts": {"Nagpur Urban": ["Sitabuldi", "Dharampeth", "Wardha Road", "Manewada"], "Nagpur Rural": ["Wadi", "Kamptee", "Hingna"]}},
            "Nashik": {"subdistricts": {"Nashik": ["Panchavati", "Satpur", "Ambad", "Indira Nagar"], "Niphad": ["Pimpalgaon", "Lasalgaon", "Niphad Khas"]}},
            "Aurangabad (Chhatrapati Sambhajinagar)": {"subdistricts": {"Aurangabad": ["CIDCO", "Waluj", "Chikalthana", "Shendra"], "Paithan": ["Paithan Khas", "Bidkin", "Pachod"]}},
            "Kolhapur": {"subdistricts": {"Karveer": ["Rajarampuri", "Tarabai Park", "Shiroli"], "Hatkanangale": ["Ichalkaranji", "Hupari", "Peth Vadgaon"]}}
        }
    },
    "Karnataka": {
        "portal": "Bhoomi Karnataka / RTC / Pahani",
        "subdistrict_name": "Taluk / Hobli",
        "primary_no_name": "Survey No (ಸರ್ವೆ ನಂ)",
        "plot_no_name": "Hissa No (ಹಿಸ್ಸಾ ನಂ)",
        "record_type": "RTC (Record of Rights, Tenancy and Crop - Pahani)",
        "districts": {
            "Bengaluru Urban": {"subdistricts": {"Bengaluru East": ["Whitefield", "Marathahalli", "Varthur", "Bellandur"], "Bengaluru South": ["Electronic City", "Begur", "Jigani", "Bannerghatta"], "Bengaluru North": ["Yelahanka", "Hebbal", "Jalahalli"]}},
            "Mysuru": {"subdistricts": {"Mysuru Taluk": ["Vijayanagar", "Gokulam", "Hebbal Industrial", "Jayalakshmipuram"], "Hunsur": ["Hunsur Town", "Bilikere", "Hanagod"]}},
            "Dakshina Kannada (Mangaluru)": {"subdistricts": {"Mangaluru": ["Kadri", "Kavoor", "Surathkal", "Panambur"], "Bantwal": ["B.C. Road", "Panemangalore", "Vittal"]}},
            "Belagavi": {"subdistricts": {"Belagavi Taluk": ["Tilakwadi", "Udyambag", "Peeranwadi"], "Gokak": ["Gokak Falls", "Konnur", "Ghataprabha"]}},
            "Hubballi-Dharwad": {"subdistricts": {"Hubballi Urban": ["Vidyanagar", "Gokul Road", "Navanagar"], "Dharwad": ["Saptapur", "Kelgerim", "Malamaddi"]}}
        }
    },
    "Bihar": {
        "portal": "BiharBhumi / DCLR / Bhunaksha Bihar",
        "subdistrict_name": "Anchal",
        "primary_no_name": "Khata No (खाता संख्या)",
        "plot_no_name": "Khesra No (खेसरा संख्या)",
        "record_type": "Jamabandi & Dakhil Kharij Panji-II",
        "districts": {
            "Patna": {"subdistricts": {"Danapur": ["Khagaul", "Digha", "Saguna", "Maner"], "Patna Sadar": ["Kankarbagh", "Rajendra Nagar", "Phulwari Sharif"], "Barh": ["Bakhtiyarpur", "Mokama", "Barh Khas"]}},
            "Gaya": {"subdistricts": {"Gaya Town": ["Bodh Gaya", "Manpur", "Tekari", "Belaganj"], "Sherghati": ["Sherghati Khas", "Dobhi", "Barachatti"]}},
            "Muzaffarpur": {"subdistricts": {"Mushahari": ["Kanti", "Motipur", "Brahmpura", "Ahiyapur"], "Sakra": ["Sakra Khas", "Dholi", "Muraul"]}},
            "Bhagalpur": {"subdistricts": {"Jagdishpur": ["Naugachia", "Sabour", "Nathnagar", "Kahalgon"], "Sultanganj": ["Sultanganj Khas", "Shahkund"]}},
            "Darbhanga": {"subdistricts": {"Darbhanga Sadar": ["Laheriasarai", "Baheri", "Benipur"], "Hayaghat": ["Hayaghat Khas", "Keoti", "Singhwara"]}}
        }
    },
    "Delhi": {
        "portal": "Delhi Bhulekh / DLRC / Revenue Dept",
        "subdistrict_name": "Tehsil / Sub-division",
        "primary_no_name": "Khata / Khatauni No",
        "plot_no_name": "Khasra No",
        "record_type": "Delhi Land Reforms (DLR) Khatauni",
        "districts": {
            "South Delhi": {"subdistricts": {"Hauz Khas": ["Mehrauli", "Sainik Farm", "Chattarpur", "Neb Sarai"], "Saket": ["Khanpur", "Tigri", "Saidulajab"]}},
            "South West Delhi": {"subdistricts": {"Dwarka": ["Najafgarh", "Matiala", "Bijwasan", "Kakrola"], "Vasant Vihar": ["Mahipalpur", "Kapashera", "Rangpuri"]}},
            "North West Delhi": {"subdistricts": {"Kanjhawala": ["Bawana", "Narela", "Alipur", "Holambi Kalan"], "Rohini": ["Rithala", "Begumpur", "Budh Vihar"]}},
            "East Delhi": {"subdistricts": {"Preet Vihar": ["Mayur Vihar", "Patparganj", "Shakarpur"], "Gandhi Nagar": ["Geeta Colony", "Krishna Nagar", "Kanti Nagar"]}}
        }
    },
    "Gujarat": {
        "portal": "AnyROR Gujarat / e-Jameen / 7/12 & 8A",
        "subdistrict_name": "Taluka",
        "primary_no_name": "Khata No (ખાતા નં)",
        "plot_no_name": "Survey No (સર્વે નં)",
        "record_type": "7/12 (Saat Bara) & 8A / VF6 Hakrakshak",
        "districts": {
            "Ahmedabad": {"subdistricts": {"Daskroi": ["Sanand", "Bavla", "Bopal", "Ghatlodia"], "Dholka": ["Dholka Khas", "Koth", "Chaloda"]}},
            "Surat": {"subdistricts": {"Chorasi": ["Adajan", "Vesu", "Katargam", "Varachha"], "Olpad": ["Olpad Khas", "Sayan", "Karanj"]}},
            "Vadodara": {"subdistricts": {"Vadodara Rural": ["Manjalpur", "Gotri", "Alkapuri", "Makarpura"], "Padra": ["Padra Khas", "Chokari", "Mobha"]}},
            "Rajkot": {"subdistricts": {"Rajkot Taluka": ["Kalawad Road", "Metoda GIDC", "Kuvadva", "Shapar"], "Gondal": ["Gondal Town", "Gomta", "Bhadla"]}}
        }
    },
    "Tamil Nadu": {
        "portal": "Anywhere AnyTime e-Services / Patta Chitta",
        "subdistrict_name": "Taluk",
        "primary_no_name": "Patta No (பட்டா எண்)",
        "plot_no_name": "Survey / Sub-div No (புல எண்)",
        "record_type": "Patta Chitta & FMB (Field Measurement Book)",
        "districts": {
            "Chennai": {"subdistricts": {"Velachery": ["Guindy", "Taramani", "Adyar", "Besant Nagar"], "Mylapore": ["Triplicane", "Alwarpet", "Royapettah"], "Egmore": ["Nungambakkam", "Kilpauk", "Chetpet"]}},
            "Coimbatore": {"subdistricts": {"Coimbatore North": ["Peelamedu", "Gandhipuram", "Saravanampatti", "Ganapathy"], "Coimbatore South": ["Sundarapuram", "Singanallur", "Kuniyamuthur"]}},
            "Madurai": {"subdistricts": {"Madurai North": ["Anna Nagar", "K.K. Nagar", "Othakadai", "Thallakulam"], "Madurai South": ["Villapuram", "Tirupparankundram", "Avaniyapuram"]}},
            "Chengalpattu": {"subdistricts": {"Tambaram": ["Chromepet", "Pallavaram", "Medavakkam", "Guduvanchery"], "Chengalpattu": ["Mahabalipuram", "Kelambakkam", "Maraimalai Nagar"]}}
        }
    },
    "West Bengal": {
        "portal": "BanglarBhumi / DLRS West Bengal",
        "subdistrict_name": "Block",
        "primary_no_name": "Khatian No (খতিয়ান নং)",
        "plot_no_name": "Dag No (দাগ নং)",
        "record_type": "ROR Khatian & Plot Map (JL Sheet)",
        "districts": {
            "Kolkata / South 24 Parganas": {"subdistricts": {"Alipore": ["Behala", "Jadavpur", "Garia", "Ballygunge"], "Baruipur": ["Sonarpur", "Rajpur", "Baruipur Khas"]}},
            "North 24 Parganas": {"subdistricts": {"Barasat": ["Rajarhat / Newtown", "Salt Lake", "Dum Dum", "Madhyamgram"], "Barrackpore": ["Khardaha", "Titagarh", "Naihati"]}},
            "Howrah": {"subdistricts": {"Howrah Sadar": ["Shibpur", "Santragachi", "Liluah", "Bally"], "Uluberia": ["Uluberia Khas", "Bagnan", "Amta"]}},
            "Darjeeling": {"subdistricts": {"Siliguri": ["Matigara", "Naxalbari", "Phansidewa"], "Darjeeling Sadar": ["Kurseong", "Mirik", "Ghoom"]}}
        }
    },
    "Rajasthan": {
        "portal": "Apna Khata / E-Dharti Rajasthan",
        "subdistrict_name": "Tehsil",
        "primary_no_name": "Khewat / Khata No (खाता संख्या)",
        "plot_no_name": "Khasra No (खसरा संख्या)",
        "record_type": "Jamabandi Nakal & Girdawari",
        "districts": {
            "Jaipur": {"subdistricts": {"Sanganer": ["Mansarovar", "Sitapura", "Pratap Nagar", "Muhana"], "Amer": ["Amer Khas", "Kukas", "Jal Mahal"], "Jaipur Sadar": ["Vaishali Nagar", "Malviya Nagar", "Jagatpura"]}},
            "Jodhpur": {"subdistricts": {"Jodhpur Sadar": ["Ratanada", "Shastri Nagar", "Mandore", "Pal"], "Luni": ["Luni Khas", "Boronada", "Kudi"]}},
            "Kota": {"subdistricts": {"Kota Ladpura": ["Vigyan Nagar", "Talwandi", "Mahaveer Nagar"], "Digod": ["Digod Khas", "Sultanpur"]}},
            "Udaipur": {"subdistricts": {"Girwa": ["Hiran Magri", "Fatehpura", "Sukher", "Bhuwana"], "Vallabhnagar": ["Kanoor", "Bhindar"]}}
        }
    },
    "Madhya Pradesh": {
        "portal": "MP Bhulekh / Bhu-Abhilekh",
        "subdistrict_name": "Tehsil",
        "primary_no_name": "Khatauni No (खतौनी)",
        "plot_no_name": "Khasra No (खसरा सं.)",
        "record_type": "Khasra-Khatauni & B-1 Kishtwar",
        "districts": {
            "Bhopal": {"subdistricts": {"Huzur": ["MP Nagar", "Arera Colony", "Kolar Road", "Bairagarh"], "Berasia": ["Berasia Khas", "Narsinghgarh Road"]}},
            "Indore": {"subdistricts": {"Indore Sadar": ["Vijay Nagar", "Palasia", "Bhawarkua", "Rau"], "Sanwer": ["Sanwer Khas", "Manglia", "Dharampuri"]}},
            "Gwalior": {"subdistricts": {"Gwalior City": ["Lashkar", "Morar", "Thatipur", "City Centre"], "Dabra": ["Dabra Khas", "Bhitarwar"]}},
            "Jabalpur": {"subdistricts": {"Jabalpur Sadar": ["Civil Lines", "Wright Town", "Adhartal", "Gorakhpur"], "Sihora": ["Sihora Khas", "Majholi"]}}
        }
    },
    "Telangana": {
        "portal": "Dharani Integrated Land Records / CCLA",
        "subdistrict_name": "Mandal",
        "primary_no_name": "Pattadar Passbook / Khata",
        "plot_no_name": "Survey No / Hissa",
        "record_type": "Dharani Pattadar Passbook & e-ROR",
        "districts": {
            "Hyderabad": {"subdistricts": {"Shaikpet": ["Banjara Hills", "Jubilee Hills", "Tolichowki"], "Serilingampally": ["Gachibowli", "Madhapur", "Kondapur", "HITEC City"], "Secunderabad": ["Begumpet", "Tarnaka", "Marredpally"]}},
            "Medchal-Malkajgiri": {"subdistricts": {"Kukatpally": ["KPHB Colony", "Moosapet", "Nizampet"], "Uppal": ["Uppal Khas", "Nacharam", "Mallapur"]}},
            "Rangareddy": {"subdistricts": {"Rajendranagar": ["Attapur", "Shamshabad", "Budvel"], "Maheshwaram": ["Mansanpally", "Thummalur"]}}
        }
    },
    "Andhra Pradesh": {
        "portal": "Meebhoomi Andhra Pradesh / Webland",
        "subdistrict_name": "Mandal",
        "primary_no_name": "Khata No (ఖాతా సంఖ్య)",
        "plot_no_name": "Survey No (సర్వే సంఖ్య)",
        "record_type": "Adangal / 1B Namuna Record",
        "districts": {
            "Visakhapatnam": {"subdistricts": {"Gajuwaka": ["Kurmannapalem", "Sheelanagar", "Duvvada"], "Visakhapatnam Urban": ["MVP Colony", "Siripuram", "Madhurawada"]}},
            "NTR (Vijayawada)": {"subdistricts": {"Vijayawada Urban": ["Benz Circle", "Governorpet", "Patamata"], "Gannavaram": ["Gannavaram Airport", "Atkur", "Kesarapalle"]}},
            "Guntur": {"subdistricts": {"Guntur Urban": ["Brodipet", "Arundelpet", "Kothapet"], "Mangalagiri": ["Amaravati Core", "Nidamarru", "Nowlur"]}}
        }
    },
    "Punjab": {
        "portal": "Jamabandi Punjab / PLRS",
        "subdistrict_name": "Tehsil",
        "primary_no_name": "Khewat / Khatoni No",
        "plot_no_name": "Khasra / Murabba No",
        "record_type": "Jamabandi Nakal & Fard",
        "districts": {
            "Ludhiana": {"subdistricts": {"Ludhiana East": ["Model Town", "Sarabha Nagar", "Civil Lines"], "Ludhiana West": ["Ferozepur Road", "BRS Nagar", "Pakhowal"]}},
            "SAS Nagar (Mohali)": {"subdistricts": {"Mohali": ["Sector 68", "Sector 82 IT City", "Aerocity"], "Kharar": ["Kharar Town", "Sunny Enclave", "Kurali"]}},
            "Amritsar": {"subdistricts": {"Amritsar-I": ["Ranjit Avenue", "Civil Lines", "Mall Road"], "Amritsar-II": ["Chheharta", "Verka", "Majitha"]}}
        }
    },
    "Haryana": {
        "portal": "Jamabandi Haryana / Web-HALRIS",
        "subdistrict_name": "Tehsil",
        "primary_no_name": "Khewat / Khata No",
        "plot_no_name": "Khasra / Murabba No",
        "record_type": "Jamabandi & Nakal Record",
        "districts": {
            "Gurugram": {"subdistricts": {"Gurugram Sadar": ["Cyber City", "Golf Course Road", "DLF Phase 1-5"], "Wazirabad": ["Sector 56", "Sector 57", "Sushant Lok"], "Manesar": ["IMT Manesar", "Kasan", "Naharpur"]}},
            "Faridabad": {"subdistricts": {"Faridabad Sadar": ["Sector 15", "Sector 16", "NIT Faridabad"], "Ballabgarh": ["Sector 58", "Prithla", "Chhainsa"]}},
            "Karnal": {"subdistricts": {"Karnal Sadar": ["Model Town", "Sector 6", "Kunjpura"], "Gharaunda": ["Gharaunda Khas", "Kohand", "Bastara"]}}
        }
    },
    "Odisha": {
        "portal": "Bhulekh Odisha / e-Dharti Odisha",
        "subdistrict_name": "Tahasil",
        "primary_no_name": "Khata No (ଖାତା ନମ୍ବର)",
        "plot_no_name": "Plot No (ପ୍ଲଟ ନମ୍ବର)",
        "record_type": "RoR (Record of Rights) & Naksha",
        "districts": {
            "Khordha (Bhubaneswar)": {"subdistricts": {"Bhubaneswar": ["Saheed Nagar", "Patia", "Chandrasekharpur", "Khandagiri"], "Jatni": ["Jatni Town", "IIT Area", "Khurda Road"]}},
            "Cuttack": {"subdistricts": {"Cuttack Sadar": ["Badambadi", "CDA Sector 9", "Choudwar"], "Salipur": ["Salipur Khas", "Nischintakoili"]}}
        }
    },
    "Kerala": {
        "portal": "e-Rekha Kerala / Bhoomi Keralam",
        "subdistrict_name": "Taluk",
        "primary_no_name": "Thandaper No (താണ്ഡപ്പേര്)",
        "plot_no_name": "Survey No / Re-survey No",
        "record_type": "Basic Tax Register (BTR) & FMB Sketch",
        "districts": {
            "Ernakulam (Kochi)": {"subdistricts": {"Kanayannur": ["Edappally", "Kakkanad InfoPark", "Kaloor", "Marine Drive"], "Aluva": ["Aluva Town", "Angamaly", "Nedumbassery Airport"]}},
            "Thiruvananthapuram": {"subdistricts": {"Thiruvananthapuram": ["Technopark", "Kowdiar", "Pattom", "Kazhakoottam"], "Neyyattinkara": ["Neyyattinkara Town", "Vizhinjam Port", "Balaramapuram"]}}
        }
    },
    "Assam": {
        "portal": "Dharitree / ILRMS Assam",
        "subdistrict_name": "Revenue Circle",
        "primary_no_name": "Patta No (পাট্টা নং)",
        "plot_no_name": "Dag No (দাগ নং)",
        "record_type": "Jamabandi Chitha & Dharitree ROR",
        "districts": {
            "Kamrup Metro (Guwahati)": {"subdistricts": {"Dispur": ["GS Road", "Beltola", "Khanapara", "Six Mile"], "Guwahati": ["Paltan Bazar", "Ulubari", "Chandmari"]}},
            "Cachar (Silchar)": {"subdistricts": {"Silchar": ["Tarapur", "Meherpur", "Rangirkhari"], "Sonai": ["Sonai Khas", "Dholai"]}}
        }
    },
    "Uttarakhand": {
        "portal": "Devbhoomi Uttarakhand Bhulekh",
        "subdistrict_name": "Tehsil",
        "primary_no_name": "Khatauni No (खतौनी संख्या)",
        "plot_no_name": "Khasra No (खसरा संख्या)",
        "record_type": "Devbhoomi 12-Column ROR",
        "districts": {
            "Dehradun": {"subdistricts": {"Dehradun Sadar": ["Rajpur Road", "Clement Town", "Sahastradhara"], "Rishikesh": ["Rishikesh Town", "Tapovan", "Raiwala"]}},
            "Haridwar": {"subdistricts": {"Haridwar Sadar": ["Kankhal", "Jwalapur", "SIDCUL"], "Roorkee": ["Roorkee Cantt", "IIT Area", "Bhagwanpur"]}}
        }
    },
    "Himachal Pradesh": {
        "portal": "Himbhoomi / Land Records HP",
        "subdistrict_name": "Tehsil",
        "primary_no_name": "Khewat / Khatauni No",
        "plot_no_name": "Khasra No",
        "record_type": "Jamabandi Nakal",
        "districts": {
            "Shimla": {"subdistricts": {"Shimla Urban": ["The Mall", "Chotta Shimla", "Sanjauli"], "Shimla Rural": ["Dhalli", "Kasumpti", "Totu"]}},
            "Kangra": {"subdistricts": {"Dharamshala": ["McLeod Ganj", "Kotwali", "Dari"], "Kangra Sadar": ["Kangra Town", "Gaggal", "Nagrota Bagwan"]}}
        }
    },
    "Goa": {
        "portal": "Goa Land Records / Form I & XIV",
        "subdistrict_name": "Taluka",
        "primary_no_name": "Form I & XIV Chalta No",
        "plot_no_name": "Survey / Sub-division No",
        "record_type": "Form I & XIV Index of Land",
        "districts": {
            "North Goa": {"subdistricts": {"Tiswadi (Panaji)": ["Miramar", "Dona Paula", "Caranzalem", "Ribandar"], "Bardez (Mapusa)": ["Calangute", "Candolim", "Porvorim", "Anjuna"]}},
            "South Goa": {"subdistricts": {"Salcete (Margao)": ["Colva", "Benaulim", "Fatorda", "Navelim"], "Mormugao (Vasco)": ["Bogmalo", "Chicalim", "Dabolim"]}}
        }
    },
    "Jammu and Kashmir": {
        "portal": "Aapki Zameen Aapki Nigrani / Land Records J&K",
        "subdistrict_name": "Tehsil",
        "primary_no_name": "Khewat / Khata No",
        "plot_no_name": "Khasra No",
        "record_type": "Jamabandi & Digital Girdawari",
        "districts": {
            "Srinagar": {"subdistricts": {"Srinagar South": ["Lal Chowk", "Rajbagh", "Jawahar Nagar"], "Srinagar North": ["Hazratbal", "Soura", "Zadibal"]}},
            "Jammu": {"subdistricts": {"Jammu South": ["Gandhi Nagar", "Bahu Fort", "Trikuta Nagar"], "Jammu North": ["Janipur", "Bantalab", "Roop Nagar"]}}
        }
    },
    "Chandigarh": {
        "portal": "Chandigarh Land Records",
        "subdistrict_name": "Sub-division",
        "primary_no_name": "Estate / Sector No",
        "plot_no_name": "Plot / Khasra No",
        "record_type": "Chandigarh Estate Office Registry",
        "districts": {
            "Chandigarh": {"subdistricts": {"Chandigarh Central": ["Sector 17", "Sector 35", "Sector 8"], "Chandigarh South": ["Sector 43", "Sector 44", "Manimajra"]}}
        }
    },
    "Puducherry": {
        "portal": "Nilamagal Puducherry",
        "subdistrict_name": "Taluk",
        "primary_no_name": "Patta No",
        "plot_no_name": "Cadastre / Survey No",
        "record_type": "Patta Chitta Record",
        "districts": {
            "Puducherry": {"subdistricts": {"Puducherry": ["White Town", "Lawspet", "Ariyankuppam"], "Villianur": ["Villianur Khas", "Koodapakkam"]}}
        }
    }
}

FIRST_NAMES = ["Ramesh", "Suresh", "Sunil", "Rajesh", "Anita", "Prakash", "Manish", "Deepak", "Binod", "Amit", "Manoj", "Sanjay", "Vikram", "Preeti", "Suman", "Arun", "Pankaj", "Alok", "Venkat", "Karthik", "Sneha", "Pooja", "Ananya", "Rohan", "Rahul", "Aditya", "Pradeep", "Subhash", "Harpreet", "Gurpreet", "Chandan", "Avinash"]
LAST_NAMES = ["Mahato", "Singh", "Soren", "Kumar", "Verma", "Sharma", "Prasad", "Munda", "Murmu", "Devi", "Roy", "Yadav", "Tudu", "Hembram", "Orao", "Mishra", "Patil", "Deshmukh", "Kulkarni", "Joshi", "Iyer", "Reddy", "Rao", "Nair", "Menon", "Banerjee", "Mukherjee", "Chatterjee", "Gupta", "Agarwal", "Choudhary", "Kaur"]

LAND_TYPES = ["Agricultural", "Residential", "Commercial", "Industrial", "Government / Nazul Land", "Gair Majarua (Public)", "Forest / Eco-sensitive Boundary"]

# Base coordinates for Indian States & Major Cities
STATE_GEO_BASES = {
    "Jharkhand": (23.6693, 86.1511),
    "Uttar Pradesh": (26.8467, 80.9462),
    "Maharashtra": (18.5204, 73.8567),
    "Karnataka": (12.9716, 77.5946),
    "Bihar": (25.5941, 85.1376),
    "Delhi": (28.6139, 77.2090),
    "Gujarat": (23.0225, 72.5714),
    "Tamil Nadu": (13.0827, 80.2707),
    "West Bengal": (22.5726, 88.3639),
    "Rajasthan": (26.9124, 75.7873),
    "Madhya Pradesh": (23.2599, 77.4126),
    "Telangana": (17.3850, 78.4867),
    "Andhra Pradesh": (16.5062, 80.6480),
    "Punjab": (30.9010, 75.8573),
    "Haryana": (28.4595, 77.0266),
    "Odisha": (20.2961, 85.8245),
    "Kerala": (9.9312, 76.2673),
    "Assam": (26.1445, 91.7362),
    "Uttarakhand": (30.3165, 78.0322),
    "Himachal Pradesh": (31.1048, 77.1734),
    "Goa": (15.2993, 74.1240),
    "Jammu and Kashmir": (34.0837, 74.7973),
    "Chandigarh": (30.7333, 76.7794),
    "Puducherry": (11.9416, 79.8083)
}

def random_person_name():
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"

def generate_random_polygon(base_lat, base_lng):
    """Generates a realistic 4-point parcel polygon relative to base coordinates."""
    offset_lat = random.uniform(0.001, 0.005)
    offset_lng = random.uniform(0.001, 0.005)
    
    p1 = [base_lng, base_lat]
    p2 = [base_lng + offset_lng, base_lat]
    p3 = [base_lng + offset_lng, base_lat + offset_lat]
    p4 = [base_lng, base_lat + offset_lat]
    p5 = p1 # Close loop
    
    return json.dumps({
        "type": "Polygon",
        "coordinates": [[p1, p2, p3, p4, p5]]
    })

def seed_synthetic_dataset(num_parcels: int = 10000, force_reseed: bool = False):
    """
    Seeds synthetic multi-state land parcels database covering Pan-India states.
    Ensures high-quality data representation across Indian states and districts.
    """
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM land_parcels")
    existing_count = cursor.fetchone()[0]
    if existing_count >= num_parcels and not force_reseed:
        print(f"Database already contains {existing_count} land parcels.")
        conn.close()
        return

    if force_reseed:
        cursor.execute("DELETE FROM land_parcels;")
        cursor.execute("DELETE FROM khatian_records;")
        cursor.execute("DELETE FROM register2_records;")
        cursor.execute("DELETE FROM mutations;")
        cursor.execute("DELETE FROM transactions;")
        cursor.execute("DELETE FROM court_cases;")
        cursor.execute("DELETE FROM encumbrances;")
        cursor.execute("DELETE FROM risk_findings;")
        conn.commit()

    print(f"Seeding synthetic dataset across all Pan-India states...")
    
    all_states = list(PAN_INDIA_DATA.keys())
    
    # Batch containers
    parcels_batch = []
    khatian_batch = []
    register2_batch = []
    mutations_batch = []
    transactions_batch = []
    court_cases_batch = []
    encumbrances_batch = []

    mutation_app_counter = 10001
    deed_counter = 50001
    case_counter = 20001

    # 1. Guaranteed Prime Demo Parcels for Major States
    prime_demos = [
        # Jharkhand Demo Story
        {"state": "Jharkhand", "dist": "Bokaro", "sub": "Chas", "vil": "Kura", "halka": "Halka 04", "p_no": "125", "pl_no": "450/2", "anomaly": "DEMO_STORY", "area": 1.25, "owner": "Ramesh Mahato", "buyer": "Sunil Kumar Singh"},
        # Uttar Pradesh Noida Demo
        {"state": "Uttar Pradesh", "dist": "Gautam Buddha Nagar (Noida)", "sub": "Dadri", "vil": "Bhangel", "halka": "Sector 62 Zone", "p_no": "340", "pl_no": "112/1", "anomaly": "R006_TRANSACTION_MISMATCH", "area": 2.40, "owner": "Rajesh Sharma", "buyer": "Amit Verma"},
        # Maharashtra Pune Hinjawadi Demo
        {"state": "Maharashtra", "dist": "Pune", "sub": "Haveli", "vil": "Hinjawadi", "halka": "Infotech Sector", "p_no": "145", "pl_no": "23/B", "anomaly": "R004_R005_MUTATION", "area": 3.80, "owner": "Suresh Patil", "buyer": "Vikram Deshmukh"},
        # Karnataka Bengaluru Whitefield Demo
        {"state": "Karnataka", "dist": "Bengaluru Urban", "sub": "Bengaluru East", "vil": "Whitefield", "halka": "ITPL Zone", "p_no": "89", "pl_no": "3A", "anomaly": "CLEAN", "area": 1.50, "owner": "Karthik Reddy", "buyer": "Karthik Reddy"},
        # Bihar Patna Danapur Demo
        {"state": "Bihar", "dist": "Patna", "sub": "Danapur", "vil": "Khagaul", "halka": "Halka 02", "p_no": "201", "pl_no": "56/3", "anomaly": "R007_COURT_DISPUTE", "area": 0.85, "owner": "Manoj Yadav", "buyer": "Deepak Prasad"},
        # Delhi Hauz Khas / Mehrauli Demo
        {"state": "Delhi", "dist": "South Delhi", "sub": "Hauz Khas", "vil": "Mehrauli", "halka": "Heritage Zone", "p_no": "56", "pl_no": "12/A", "anomaly": "MULTI_RISK", "area": 0.50, "owner": "Pankaj Gupta", "buyer": "Alok Agarwal"},
        # Tamil Nadu Chennai Guindy Demo
        {"state": "Tamil Nadu", "dist": "Chennai", "sub": "Velachery", "vil": "Guindy", "halka": "Industrial Area", "p_no": "450", "pl_no": "12", "anomaly": "CLEAN", "area": 1.10, "owner": "Venkat Iyer", "buyer": "Venkat Iyer"},
        # Gujarat Ahmedabad Sanand Demo
        {"state": "Gujarat", "dist": "Ahmedabad", "sub": "Daskroi", "vil": "Sanand", "halka": "Auto Hub Zone", "p_no": "78", "pl_no": "34", "anomaly": "R002_AREA_MISMATCH", "area": 4.20, "owner": "Pooja Joshi", "buyer": "Pooja Joshi"}
    ]

    for demo in prime_demos:
        st = demo["state"]
        dist = demo["dist"]
        sub = demo["sub"]
        vil = demo["vil"]
        halka = demo["halka"]
        p_no = demo["p_no"]
        pl_no = demo["pl_no"]
        anomaly = demo["anomaly"]
        area = demo["area"]
        orig_owner = demo["owner"]
        
        land_id = generate_land_identity_id(st, dist, sub, vil, p_no, pl_no)
        land_type = "Agricultural" if "Demo" in vil else "Commercial"
        
        base_lat, base_lng = STATE_GEO_BASES.get(st, (23.6693, 86.1511))
        poly_json = generate_random_polygon(base_lat, base_lng)
        
        parcels_batch.append((land_id, st, dist, sub, halka, vil, p_no, pl_no, area, land_type, poly_json))
        khatian_batch.append((land_id, orig_owner, f"Late {orig_owner.split()[0]}", "General", p_no, pl_no, area, PAN_INDIA_DATA[st]["record_type"], "1980-05-10"))
        
        if anomaly == "CLEAN":
            register2_batch.append((land_id, orig_owner, f"Vol 12", f"Page 45", "PAID", "2025-2026", area, "Verified Clear Record"))
        elif anomaly in ["DEMO_STORY", "R001_OWNER_MISMATCH"]:
            cur_owner = demo["buyer"]
            register2_batch.append((land_id, cur_owner, f"Vol 05", f"Page 89", "PAID", "2025-2026", area, "Name mismatch noted"))
            mutations_batch.append((land_id, f"{STATE_CODES.get(st, 'IN')}-MUT-2026-{mutation_app_counter}", cur_owner, cur_owner, orig_owner, "PENDING", "Revenue Review", "2026-06-10", "2026-08-01", 73, 30, "Pending review"))
            mutation_app_counter += 1
        elif anomaly == "R002_AREA_MISMATCH":
            register2_batch.append((land_id, orig_owner, f"Vol 08", f"Page 34", "PAID", "2025-2026", round(area + 0.65, 2), "Area variance detected"))
        elif anomaly == "R004_R005_MUTATION":
            register2_batch.append((land_id, orig_owner, f"Vol 14", f"Page 22", "PAID", "2025-2026", area, "Pending mutation over SLA"))
            applicant = demo["buyer"]
            mutations_batch.append((land_id, f"{STATE_CODES.get(st, 'IN')}-MUT-2026-{mutation_app_counter}", applicant, applicant, orig_owner, "PENDING", "Field Verification", "2026-05-10", "2026-07-01", 85, 30, "SLA exceeded"))
            mutation_app_counter += 1
        elif anomaly == "R006_TRANSACTION_MISMATCH":
            register2_batch.append((land_id, orig_owner, f"Vol 20", f"Page 11", "PAID", "2025-2026", area, "Unmutated deed"))
            transactions_batch.append((land_id, f"DEED-2025-{deed_counter}", "Sale Deed", orig_owner, demo["buyer"], area, round(area * 1200000, 2), "2025-10-15", f"Sub-Registrar Office {dist}"))
            deed_counter += 1
        elif anomaly == "R007_COURT_DISPUTE":
            register2_batch.append((land_id, orig_owner, f"Vol 18", f"Page 77", "PAID", "2025-2026", area, "Dispute pending in court"))
            court_cases_batch.append((land_id, f"REV-CASE-{case_counter}/2025", f"Revenue Court {dist}", "Title & Partition Suit", "Chandan Mishra", orig_owner, "PENDING", 1, "2025-09-02", "Interim injunction stay order active"))
            case_counter += 1
        else: # MULTI_RISK
            register2_batch.append((land_id, demo["buyer"], f"Vol 33", f"Page 101", "DUE", "2024-2025", round(area + 0.4, 2), "Multiple high risk flags"))
            court_cases_batch.append((land_id, f"CIVIL-CASE-{case_counter}/2024", f"District Civil Court {dist}", "Title Injunction", "Avinash Roy", orig_owner, "PENDING", 1, "2024-12-10", "Stay on registry and alienation"))
            case_counter += 1
            encumbrances_batch.append((land_id, "State Bank of India", "Equitable Mortgage", round(area * 1500000, 2), "ACTIVE", "2024-03-12"))

    # 2. Generate remaining parcels distributed across all states
    remaining = num_parcels - len(prime_demos)
    for i in range(1, remaining + 1):
        st = random.choice(all_states)
        st_data = PAN_INDIA_DATA[st]
        dist_list = list(st_data["districts"].keys())
        dist = random.choice(dist_list)
        
        subs_map = st_data["districts"][dist]["subdistricts"]
        sub = random.choice(list(subs_map.keys()))
        vil = random.choice(subs_map[sub])
        halka = f"Circle/Halka 0{random.randint(1, 9)}"
        p_no = str(random.randint(10, 950))
        pl_no = f"{random.randint(100, 999)}/{random.randint(1, 6)}"
        
        # Determine anomaly type
        rand_val = random.random()
        if rand_val < 0.68:
            anomaly_type = "CLEAN"
        elif rand_val < 0.78:
            anomaly_type = "R001_OWNER_MISMATCH"
        elif rand_val < 0.84:
            anomaly_type = "R002_AREA_MISMATCH"
        elif rand_val < 0.89:
            anomaly_type = "R004_R005_MUTATION"
        elif rand_val < 0.93:
            anomaly_type = "R006_TRANSACTION_MISMATCH"
        elif rand_val < 0.96:
            anomaly_type = "R007_COURT_DISPUTE"
        else:
            anomaly_type = "MULTI_RISK"

        land_id = generate_land_identity_id(st, dist, sub, vil, p_no, pl_no)
        area_acre = round(random.uniform(0.25, 8.50), 2)
        land_type = random.choice(LAND_TYPES)
        
        base_lat, base_lng = STATE_GEO_BASES.get(st, (23.6693, 86.1511))
        base_lat += random.uniform(-0.06, 0.06)
        base_lng += random.uniform(-0.06, 0.06)
        
        poly_json = generate_random_polygon(base_lat, base_lng) if anomaly_type != "R003_NO_MAP" else None

        parcels_batch.append((
            land_id, st, dist, sub, halka, vil, p_no, pl_no, area_acre, land_type, poly_json
        ))

        original_owner = random_person_name()
        father_name = f"Late {random_person_name().split()[0]} {original_owner.split()[-1]}"
        
        khatian_batch.append((
            land_id, original_owner, father_name, "General", p_no, pl_no, area_acre, st_data["record_type"], "1975-04-15"
        ))

        st_prefix = STATE_CODES.get(st, "IN")

        if anomaly_type == "CLEAN":
            register2_batch.append((
                land_id, original_owner, f"Vol {random.randint(1,50)}", f"Page {random.randint(10,200)}", "PAID", "2025-2026", area_acre, "Clear title"
            ))
        elif anomaly_type == "R001_OWNER_MISMATCH":
            r_owner = random_person_name()
            register2_batch.append((
                land_id, r_owner, f"Vol {random.randint(1,50)}", f"Page {random.randint(10,200)}", "PAID", "2025-2026", area_acre, "Owner mismatch"
            ))
            mutations_batch.append((
                land_id, f"{st_prefix}-MUT-2026-{mutation_app_counter}", r_owner, r_owner, original_owner, "PENDING", "Revenue Review", "2026-06-15", "2026-08-01", 68, 30, "Pending review"
            ))
            mutation_app_counter += 1

        elif anomaly_type == "R002_AREA_MISMATCH":
            register2_batch.append((
                land_id, original_owner, f"Vol {random.randint(1,50)}", f"Page {random.randint(10,200)}", "PAID", "2025-2026", round(area_acre + random.uniform(0.2, 0.8), 2), "Area variance"
            ))

        elif anomaly_type == "R004_R005_MUTATION":
            register2_batch.append((
                land_id, original_owner, f"Vol {random.randint(1,50)}", f"Page {random.randint(10,200)}", "PAID", "2025-2026", area_acre, "Mutation overdue"
            ))
            applicant = random_person_name()
            age_days = random.randint(45, 130)
            mutations_batch.append((
                land_id, f"{st_prefix}-MUT-2026-{mutation_app_counter}", applicant, applicant, original_owner, "PENDING", "Field Verification", "2026-04-10", "2026-06-01", age_days, 30, "SLA exceeded"
            ))
            mutation_app_counter += 1

        elif anomaly_type == "R006_TRANSACTION_MISMATCH":
            register2_batch.append((
                land_id, original_owner, f"Vol {random.randint(1,50)}", f"Page {random.randint(10,200)}", "PAID", "2025-2026", area_acre, "Unmutated deed"
            ))
            buyer = random_person_name()
            transactions_batch.append((
                land_id, f"DEED-2025-{deed_counter}", "Sale Deed", original_owner, buyer, area_acre, round(area_acre * 950000, 2), "2025-11-12", f"Sub-Registrar Office {dist}"
            ))
            deed_counter += 1

        elif anomaly_type == "R007_COURT_DISPUTE":
            register2_batch.append((
                land_id, original_owner, f"Vol {random.randint(1,50)}", f"Page {random.randint(10,200)}", "PAID", "2025-2026", area_acre, "Dispute pending"
            ))
            petitioner = random_person_name()
            court_cases_batch.append((
                land_id, f"REV-CASE-{case_counter}/2025", f"Revenue Court {dist}", "Title & Partition Suit", petitioner, original_owner, "PENDING", 1, "2025-08-10", "Interim stay granted"
            ))
            case_counter += 1

        else: # MULTI_RISK
            r_owner = random_person_name()
            register2_batch.append((
                land_id, r_owner, f"Vol {random.randint(1,50)}", f"Page {random.randint(10,200)}", "DUE", "2023-2024", round(area_acre + 0.5, 2), "Multiple flags"
            ))
            petitioner = random_person_name()
            court_cases_batch.append((
                land_id, f"CIVIL-CASE-{case_counter}/2024", f"District Civil Court {dist}", "Title Injunction", petitioner, original_owner, "PENDING", 1, "2024-11-20", "Stay on transfer"
            ))
            case_counter += 1
            encumbrances_batch.append((
                land_id, "State Bank of India / HDFC Bank", "Equitable Mortgage", round(area_acre * 800000, 2), "ACTIVE", "2024-04-18"
            ))

    # Bulk execute inserts
    cursor.executemany("""
    INSERT INTO land_parcels (land_identity_id, state, district, anchal, halka, mauza, khata_no, khesra_no, area_acre, land_type, polygon_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, parcels_batch)

    cursor.executemany("""
    INSERT INTO khatian_records (land_identity_id, owner_name, father_husband_name, caste, khata_no, khesra_no, recorded_area_acre, khatian_type, record_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, khatian_batch)

    cursor.executemany("""
    INSERT INTO register2_records (land_identity_id, current_owner_name, volume_no, page_no, lagan_status, last_paid_year, recorded_area_acre, remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, register2_batch)

    cursor.executemany("""
    INSERT INTO mutations (land_identity_id, application_no, applicant_name, buyer_name, seller_name, status, current_stage, submitted_at, updated_at, age_days, sla_days, remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, mutations_batch)

    cursor.executemany("""
    INSERT INTO transactions (land_identity_id, deed_no, deed_type, seller_name, buyer_name, transacted_area_acre, consideration_amount_inr, registration_date, registration_office)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, transactions_batch)

    cursor.executemany("""
    INSERT INTO court_cases (land_identity_id, case_no, court_name, case_type, petitioner, respondent, status, stay_order, filing_date, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, court_cases_batch)

    cursor.executemany("""
    INSERT INTO encumbrances (land_identity_id, bank_institution, mortgage_type, loan_amount_inr, charge_status, registration_date)
    VALUES (?, ?, ?, ?, ?, ?)
    """, encumbrances_batch)

    conn.commit()
    conn.close()
    print(f"Successfully seeded {len(parcels_batch)} Pan-India synthetic land parcels into BhoomiShield.")

if __name__ == "__main__":
    seed_synthetic_dataset(10000, force_reseed=True)
