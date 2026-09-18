// lib/geoData.ts
export interface StateData {
  state: string;
  districts: string[];
}

export const INDIA_STATES_DATA: StateData[] = [
  {
    state: "Andhra Pradesh",
    districts: [
      "Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", 
      "Prakasam", "Sri Potti Sriramulu Nellore", "Srikakulam", "Visakhapatnam", 
      "Vizianagaram", "West Godavari", "YSR Kadapa", "Parvathipuram Manyam", 
      "Alluri Sitharama Raju", "Anakapalli", "Kakinada", "Konaseema", "Eluru", 
      "NTR", "Bapatla", "Palnadu", "Nandyal", "Sri Sathya Sai", "Annamayya", "Tirupati"
    ]
  },
  {
    state: "Arunachal Pradesh",
    districts: [
      "Tawang", "West Kameng", "East Kameng", "Papum Pare", "Kurung Kumey", 
      "Kra Daadi", "Lower Subansiri", "Upper Subansiri", "West Siang", "East Siang", 
      "Siang", "Upper Siang", "Lower Siang", "Lower Dibang Valley", "Dibang Valley", 
      "Anjaw", "Lohit", "Namsai", "Changlang", "Tirap", "Longding", "Kamle", 
      "Pakke Kessang", "Lepa Rada", "Shi Yomi"
    ]
  },
  {
    state: "Assam",
    districts: [
      "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", 
      "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", 
      "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup", 
      "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", 
      "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", 
      "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong", "Bajali", "Tamulpur"
    ]
  },
  {
    state: "Bihar",
    districts: [
      "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", 
      "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", 
      "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", 
      "Lakhisarai", "Madhepura", "Madhbani", "Munger", "Muzaffarpur", "Nalanda", 
      "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", 
      "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"
    ]
  },
  {
    state: "Chhattisgarh",
    districts: [
      "Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", 
      "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Janjgir-Champa", 
      "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", 
      "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", 
      "Sukma", "Surajpur", "Surguja", "Gaurela-Pendra-Marwahi", "Manendragarh-Chirmiri-Bharatpur", 
      "Mohla-Manpur-Ambagarh Chowki", "Sakti", "Sarangarh-Bilaigarh", "Khairagarh-Chhuikhadan-Gandai"
    ]
  },
  {
    state: "Goa",
    districts: ["North Goa", "South Goa"]
  },
  {
    state: "Gujarat",
    districts: [
      "Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", 
      "Bhavnagar", "Botad", "Chhota Udepur", "Dahod", "Dang", "Devbhumi Dwarka", 
      "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", 
      "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", 
      "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", 
      "Tapi", "Vadodara", "Valsad"
    ]
  },
  {
    state: "Haryana",
    districts: [
      "Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", 
      "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", 
      "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"
    ]
  },
  {
    state: "Himachal Pradesh",
    districts: [
      "Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", 
      "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"
    ]
  },
  {
    state: "Jharkhand",
    districts: [
      "Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", 
      "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", 
      "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", 
      "Sahibganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"
    ]
  },
  {
    state: "Karnataka",
    districts: [
      "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", 
      "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", 
      "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", 
      "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", 
      "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir", "Vijayanagara"
    ]
  },
  {
    state: "Kerala",
    districts: [
      "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", 
      "Kouayam", "Kozhikode", "Malappuram", "Wayanad", "Palakkad", "Pathanamthitta", 
      "Thiruvananthapuram", "Thrissur"
    ]
  },
  {
    state: "Madhya Pradesh",
    districts: [
      "Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", 
      "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", 
      "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Narmadapuram", 
      "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", 
      "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Niwari", "Panna", "Raisen", 
      "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", 
      "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", 
      "Umaria", "Vidisha", "Mauganj", "Maihar", "Pandhurna"
    ]
  },
  {
    state: "Maharashtra",
    districts: [
      "Ahmednagar", "Akola", "Amravati", "Chhatrapati Sambhajinagar (formerly Aurangabad)", 
      "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", 
      "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", 
      "Nagpur", "Nanded", "Nandurbar", "Nashik", "Dharashiv (formerly Osmanabad)", 
      "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", 
      "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"
    ]
  },
  {
    state: "Manipur",
    districts: [
      "Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", 
      "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", 
      "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"
    ]
  },
  {
    state: "Meghalaya",
    districts: [
      "East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", 
      "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", 
      "West Garo Hills", "West Jaintia Hills", "West Khasi Hills", "Eastern West Khasi Hills"
    ]
  },
  {
    state: "Mizoram",
    districts: [
      "Aizawl", "Champhai", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", 
      "Saiha", "Serchhip", "Hnahthial", "Khawzawl", "Saitual"
    ]
  },
  {
    state: "Nagaland",
    districts: [
      "Chümoukedima", "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", 
      "Mon", "Niuland", "Noklak", "Peren", "Phek", "Shamator", "Tseminyū", 
      "Tuensang", "Wokha", "Zunheboto"
    ]
  },
  {
    state: "Odisha",
    districts: [
      "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", 
      "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", 
      "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", 
      "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", 
      "Puri", "Rayagada", "Sambalpur", "Subarnapur (Sonepur)", "Sundargarh"
    ]
  },
  {
    state: "Punjab",
    districts: [
      "Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", 
      "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", 
      "Malerkotla", "Mansa", "Moga", "Sri Muktsar Sahib", "Pathankot", "Patiala", 
      "Rupnagar", "Sahibzada Ajit Singh Nagar (Mohali)", "Sangrur", 
      "Shahid Bhagat Singh Nagar (Nawanshahr)", "Tarn Taran"
    ]
  },
  {
    state: "Rajasthan",
    districts: [
      "Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", 
      "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", 
      "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", 
      "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", 
      "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur", 
      "Anupgarh", "Balotra", "Beawar", "Deeg", "Didwana-Kuchaman", "Dudu", 
      "Gangapur City", "Jaipur Rural", "Jodhpur Rural", "Kekri", "Khairthal-Tijara", 
      "Kotputli-Behror", "Neem Ka Thana", "Phalodi", "Salumbar", "Sanchore", "Shahpura"
    ]
  },
  {
    state: "Sikkim",
    districts: ["Gangtok", "Mangan", "Namchi", "Gyalshing", "Pakyong", "Soreng"]
  },
  {
    state: "Tamil Nadu",
    districts: [
      "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", 
      "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", 
      "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", 
      "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", 
      "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", 
      "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", 
      "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"
    ]
  },
  {
    state: "Telangana",
    districts: [
      "Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", 
      "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", 
      "Khammam", "Kumuram Bheem", "Mahabubabad", "Mahabubnagar", "Mancherial", 
      "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", 
      "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", 
      "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", 
      "Hanamkonda (Warangal Urban)", "Warangal (Warangal Rural)", "Yadadri Bhuvanagiri"
    ]
  },
  {
    state: "Tripura",
    districts: ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"]
  },
  {
    state: "Uttar Pradesh",
    districts: [
      "Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", 
      "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Bara Banki", 
      "Bareilly", "Basti", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", 
      "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", 
      "Gautam Buddha Nagar (Noida)", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", 
      "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", 
      "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", 
      "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", 
      "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", 
      "Pratapgarh", "Prayagraj", "Rae Bareli", "Rampur", "Saharanpur", "Sambhal", 
      "Sant Kabir Nagar", "Bhadohi", "Shahjahanpur", "Shamli", "Shravasti", 
      "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"
    ]
  },
  {
    state: "Uttarakhand",
    districts: [
      "Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", 
      "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", 
      "Udham Singh Nagar", "Uttarkashi"
    ]
  },
  {
    state: "West Bengal",
    districts: [
      "Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", 
      "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", 
      "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", 
      "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", 
      "Purulia", "South 24 Parganas", "Uttar Dinajpur"
    ]
  },
  {
    state: "Andaman and Nicobar Islands (UT)",
    districts: ["Nicobar", "North and Middle Andaman", "South Andaman"]
  },
  {
    state: "Chandigarh (UT)",
    districts: ["Chandigarh"]
  },
  {
    state: "Dadra and Nagar Haveli and Daman and Diu (UT)",
    districts: ["Dadra and Nagar Haveli", "Daman", "Diu"]
  },
  {
    state: "Delhi (NCT)",
    districts: [
      "Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", 
      "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"
    ]
  },
  {
    state: "Jammu and Kashmir",
    districts: [
      "Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", 
      "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Ponch", "Pulwama", "Rajouri", 
      "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"
    ]
  },
  {
    state: "Ladakh",
    districts: ["Kargil", "Leh"]
  },
  {
    state: "Lakshadweep",
    districts: ["Lakshadweep"]
  },
  {
    state: "Puducherry",
    districts: ["Karaikal", "Mahé", "Puducherry", "Yanam"]
  }
];