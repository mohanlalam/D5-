/**
 * Core Domain Constants & Configuration
 * D5 IPL Fantasy Platform
 */

export const IPL_TEAMS = {
  MI: { name: "Mumbai Indians", color: "#004BA0", short: "MI" },
  CSK: { name: "Chennai Super Kings", color: "#F5A623", short: "CSK" },
  RCB: { name: "Royal Challengers Bengaluru", color: "#EC1C24", short: "RCB" },
  KKR: { name: "Kolkata Knight Riders", color: "#3B1B6B", short: "KKR" },
  DC: { name: "Delhi Capitals", color: "#00AAE4", short: "DC" },
  SRH: { name: "Sunrisers Hyderabad", color: "#FF6B00", short: "SRH" },
  PBKS: { name: "Punjab Kings", color: "#ED1B24", short: "PBKS" },
  RR: { name: "Rajasthan Royals", color: "#EA1A85", short: "RR" },
  LSG: { name: "Lucknow Super Giants", color: "#00B4D8", short: "LSG" },
  GT: { name: "Gujarat Titans", color: "#1C4B8E", short: "GT" },
};

export const IPL_SCHEDULE = [
  { id: "m1",  date: "2026-03-28", time: "7:30 PM", team1: "CSK", team2: "RCB", venue: "MA Chidambaram Stadium, Chennai" },
  { id: "m2",  date: "2026-03-29", time: "3:30 PM", team1: "KKR", team2: "SRH", venue: "Eden Gardens, Kolkata" },
  { id: "m3",  date: "2026-03-29", time: "7:30 PM", team1: "RR",  team2: "LSG", venue: "Sawai Mansingh Stadium, Jaipur" },
  { id: "m4",  date: "2026-03-30", time: "7:30 PM", team1: "GT",  team2: "MI",  venue: "Narendra Modi Stadium, Ahmedabad" },
  { id: "m5",  date: "2026-03-31", time: "7:30 PM", team1: "PBKS",team2: "DC",  venue: "PCA Stadium, Mullanpur" },
  { id: "m6",  date: "2026-04-01", time: "7:30 PM", team1: "RCB", team2: "KKR", venue: "M. Chinnaswamy Stadium, Bengaluru" },
  { id: "m7",  date: "2026-04-02", time: "7:30 PM", team1: "SRH", team2: "CSK", venue: "Rajiv Gandhi Stadium, Hyderabad" },
  { id: "m8",  date: "2026-04-03", time: "7:30 PM", team1: "LSG", team2: "GT",  venue: "Ekana Stadium, Lucknow" },
  { id: "m9",  date: "2026-04-04", time: "3:30 PM", team1: "MI",  team2: "RR",  venue: "Wankhede Stadium, Mumbai" },
  { id: "m10", date: "2026-04-04", time: "7:30 PM", team1: "DC",  team2: "CSK", venue: "Arun Jaitley Stadium, Delhi" },
  { id: "m11", date: "2026-04-05", time: "3:30 PM", team1: "PBKS",team2: "RCB", venue: "PCA Stadium, Mullanpur" },
  { id: "m12", date: "2026-04-05", time: "7:30 PM", team1: "KKR", team2: "GT",  venue: "Eden Gardens, Kolkata" },
  { id: "m13", date: "2026-04-06", time: "7:30 PM", team1: "SRH", team2: "RR",  venue: "Rajiv Gandhi Stadium, Hyderabad" },
  { id: "m14", date: "2026-04-07", time: "7:30 PM", team1: "CSK", team2: "MI",  venue: "MA Chidambaram Stadium, Chennai" },
  { id: "m15", date: "2026-04-08", time: "7:30 PM", team1: "DC",  team2: "LSG", venue: "Arun Jaitley Stadium, Delhi" },
  { id: "m16", date: "2026-04-09", time: "7:30 PM", team1: "GT",  team2: "PBKS",venue: "Narendra Modi Stadium, Ahmedabad" },
  { id: "m17", date: "2026-04-10", time: "7:30 PM", team1: "RCB", team2: "SRH", venue: "M. Chinnaswamy Stadium, Bengaluru" },
  { id: "m18", date: "2026-04-11", time: "7:30 PM", team1: "MI",  team2: "DC",  venue: "Wankhede Stadium, Mumbai" },
  { id: "m19", date: "2026-04-12", time: "3:30 PM", team1: "RR",  team2: "KKR", venue: "Sawai Mansingh Stadium, Jaipur" },
  { id: "m20", date: "2026-04-12", time: "7:30 PM", team1: "LSG", team2: "GT",  venue: "Ekana Stadium, Lucknow" },
];

export const IPL_SQUADS = {
  MI: ["Rohit Sharma","Jasprit Bumrah","Suryakumar Yadav","Hardik Pandya","Tilak Varma","Tim David","Naman Dhir","Dewald Brevis","Will Jacks","Ryan Rickelton","Karn Sharma","Deepak Chahar","Arjun Tendulkar","Vignesh Puthur","Ashwani Kumar","Reece Topley","Trent Boult","Krishnan Shrijith","Allah Ghazanfar","Mitchell Santner","Robin Minz","Bevon Jacobs","Satyanarayana Raju"],
  CSK: ["Ruturaj Gaikwad","MS Dhoni","Ravindra Jadeja","Shivam Dube","Rachin Ravindra","Deepak Hooda","Anshul Kamboj","Khaleel Ahmed","Noor Ahmad","Rahul Tripathi","Devon Conway","Jamie Overton","Sam Curran","Vijay Shankar","Shaik Rasheed","Kamlesh Nagarkoti","Mukesh Choudhary","Nathan Ellis","Shreyas Gopal","Andre Siddarth","Gurjapneet Singh","Vansh Bedi"],
  RCB: ["Virat Kohli","Rajat Patidar","Liam Livingstone","Phil Salt","Josh Hazlewood","Mohammed Siraj","Yash Dayal","Krunal Pandya","Tim Southee","Bhuvneshwar Kumar","Jitesh Sharma","Swapnil Singh","Jacob Bethell","Manoj Bhandage","Suyash Sharma","Rasikh Dar","Lungi Ngidi","Nuwan Thushara","Devdutt Padikkal","Abhinandan Singh","Romario Shepherd"],
  KKR: ["Ajinkya Rahane","Andre Russell","Sunil Narine","Venkatesh Iyer","Quinton de Kock","Rinku Singh","Varun Chakravarthy","Mitchell Starc","Spencer Johnson","Harshit Rana","Angkrish Raghuvanshi","Moeen Ali","Mayank Markande","Manish Pandey","Rovman Powell","Rahmanullah Gurbaz","Anrich Nortje","Luvnith Sisodia","Chetan Sakariya"],
  DC: ["Axar Patel","Jake Fraser-McGurk","Tristan Stubbs","KL Rahul","Kuldeep Yadav","Mitchell Marsh","Faf du Plessis","Sameer Rizvi","Vipraj Nigam","Karun Nair","Harry Brook","Mukesh Kumar","Dushmantha Chameera","Ashutosh Sharma","Mohit Sharma","Darshan Nalkande","Donovan Ferreira","T Ravi Teja","Tripurana Vijay","Madhav Tiwari","Manvanth Kumar"],
  SRH: ["Pat Cummins","Heinrich Klaasen","Travis Head","Abhishek Sharma","Nitish Kumar Reddy","Mohammed Shami","Adam Zampa","Ishan Kishan","Simarjeet Singh","Jaydev Unadkat","Harshal Patel","Rahul Chahar","Zeeshan Ansari","Atharva Taide","Aniket Verma","Kamindu Mendis","Eshan Malinga","Brydon Carse"],
  PBKS: ["Shreyas Iyer","Shashank Singh","Arshdeep Singh","Yuzvendra Chahal","Marcus Stoinis","Prabhsimran Singh","Harpreet Brar","Glenn Maxwell","Nehal Wadhera","Azmatullah Omarzai","Xavier Bartlett","Lockie Ferguson","Suryansh Shedge","Vishwanath Tiwari","Aaron Hardie","Priyansh Arya","Kuldeep Sen","Musheer Khan","Pyla Avinash"],
  RR: ["Sanju Samson","Jos Buttler","Riyan Parag","Shimron Hetmyer","Dhruv Jurel","Yashasvi Jaiswal","Trent Boult","Jofra Archer","Wanindu Hasaranga","Sandeep Sharma","Maheesh Theekshana","Akash Madhwal","Fazalhaq Farooqi","Shubham Dubey","Kumar Kartikeya","Kwena Maphaka","Nitish Rana","Shubham Dubey","Tom Kohler-Cadmore"],
  LSG: ["KL Rahul","Nicholas Pooran","Ravi Bishnoi","Mayank Yadav","Mohsin Khan","Shamar Joseph","Aryan Juyal","David Miller","Aiden Markram","Digvesh Rathi","Matt Henry","Yash Thakur","Arshin Kulkarni","Avesh Khan","Himmat Singh","Rishabh Pant","Mitchell Marsh","Manimaran Siddharth","Akash Deep","Prince Yadav"],
  GT: ["Shubman Gill","Sai Sudharsan","Jos Buttler","Rashid Khan","Mohammed Siraj","Prasidh Krishna","Kagiso Rabada","Shahrukh Khan","Rahul Tewatia","Wriddhiman Saha","Noor Ahmad","Arshad Khan","Karim Janat","Mahipal Lomror","Gerald Coetzee","Manav Suthar","Gurnoor Brar","Kumar Kushagra","Jayant Yadav","Anuj Rawat"],
};

export const DEFAULT_2026_TEAMS = [
  { id: "T1", name: "Mvrcks", color: "#00C9FF", emoji: "🔵" },
  { id: "T2", name: "Sharks", color: "#FF6B35", emoji: "🦈" },
  { id: "T3", name: "MTR",    color: "#A8FF3E", emoji: "🟢" },
  { id: "T4", name: "Sixers", color: "#FFB830", emoji: "🟡" },
];

export const D5_TEAM_CONFIG = {
  Mvrcks: { color: "#00C9FF", emoji: "🔵" },
  Sharks: { color: "#FF6B35", emoji: "🦈" },
  MTR:    { color: "#A8FF3E", emoji: "🟢" },
  Sixers: { color: "#FFB830", emoji: "🟡" },
  Avngrs: { color: "#c084fc", emoji: "⚡" },
  Clash:  { color: "#f87171", emoji: "⚔️" },
};

export const MAIN_TEAMS = ["Mvrcks", "Sharks", "MTR", "Sixers"];

export const SCORING_RULES = {
  multipliers: {
    run: 5,
    wicket: 100,
    runOut: 50,
    stumping: 50,
    catch: 50,
    duck: -50,
  },
  bonuses: {
    runs30: 50,
    runs50: 150,
    runs100: 250,
    wkts2: 50,
    wkts3: 150,
    wkts5: 200,
    wkts6: 100,
    catches3: 100,
    catches5: 200,
    roStump3: 100,
    sixes5: 150,
    sixes10: 300,
    hatTrickWkts: 400,
    hatTrickSixes: 100,
    maidenOver: 200,
  },
  captainMultiplier: 2,
};
