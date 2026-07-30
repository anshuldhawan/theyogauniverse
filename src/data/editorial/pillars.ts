import type { Article } from "@/lib/editorial/types";

const PUBLISHED = "2026-07-28";
const EVERGREEN_REVIEW = "2027-07-28"; // 12 months
const FAST_REVIEW = "2027-01-28"; // 6 months — accreditation, pricing, destinations

/**
 * BLG-8 launch pillars. Every article here passes the BLG-21 publish gate:
 * live cluster, populated author profile, tier-matched reviewer, 40–60 word
 * answer block, ≥3 structured sources, ≥3 internal links incl. ≥1 commercial,
 * disclaimers placed per BLG-47a.
 */
export const PILLARS: Article[] = [
  {
    slug: "how-to-start-yoga",
    title: "How do you start yoga as a complete beginner?",
    format: "pillar",
    clusterId: "practice-fundamentals",
    state: "published",
    authorSlug: "mara-ellison",
    reviewerSlug: "koji-yamada",
    reviewTier: "practice",
    answerBlock:
      "Starting yoga requires no flexibility, no equipment beyond comfortable clothes, and no prior knowledge. Choose a beginner or all-levels class in a slower style such as hatha or restorative, arrive ten minutes early, and tell the teacher you are new. Most studios rent mats, and your first class is often discounted.",
    disclaimer: "none",
    excerpt:
      "No flexibility required, no Sanskrit expected. What to choose, what to bring, and what actually happens in the room.",
    minutes: 11,
    tint: "#a2d1a2",
    topics: ["hatha", "restorative", "vinyasa"],
    sections: [
      {
        heading: "Which yoga style should a beginner choose?",
        paragraphs: [
          "Choose by pace, not by philosophy: slower styles give you time to learn the shapes. [Hatha](/directory?styles=hatha) classes hold poses long enough to understand them, [restorative](/directory?styles=restorative) classes are almost entirely floor-based rest, and a beginner-labelled [vinyasa](/directory?styles=vinyasa) class moves faster but repeats the same building blocks each week.",
          "Avoid starting with hot yoga, arm-balance workshops, or anything labelled level 2–3. Nothing is wrong with those rooms — they simply assume vocabulary you have not built yet. Our guide to [the eleven yoga styles](/blog/styles) describes each one honestly, including who tends to enjoy it.",
        ],
      },
      {
        heading: "What do you need to bring to a first class?",
        paragraphs: [
          "You need comfortable clothes you can move in, water, and very little else. Studios almost always rent or lend mats, so do not buy equipment before you know you will continue.",
        ],
        list: {
          ordered: true,
          items: [
            "Book a beginner or all-levels class — use the level filter in the [directory](/directory) to find one near you.",
            "Arrive ten minutes early and tell the teacher you are new; good teachers adjust for you quietly.",
            "Take rests whenever you want. Child's pose is always allowed, in every class, at every level.",
            "Stay for the final rest (savasana) — leaving early is the one real etiquette mistake.",
          ],
        },
      },
      {
        heading: "How often should you practise at the start?",
        paragraphs: [
          "Once or twice a week is enough to make progress for the first few months, and consistency matters far more than volume. According to Yoga Alliance's 2016 Yoga in America study, most practitioners settle at one to two sessions weekly, and the beginners who continue longest are those who chose a class time they could actually keep.",
          "When a class clicks, the teacher matters more than the studio. Read [how to tell a good teacher from a popular one](/blog/teacher), then look for teachers whose credentials are verified — the [verification marker](/help/verification) on The Yoga Universe profiles means documents, not self-description.",
        ],
      },
    ],
    faqs: [
      {
        id: "flexible-enough",
        question: "Do you need to be flexible to start yoga?",
        answer:
          "No. Flexibility is an outcome of yoga practice, not a prerequisite for it. Classes offer variations for every range of motion, and props like blocks bring the floor to you. Teachers routinely say their least flexible beginners make the most visible progress in the first year.",
        health: false,
      },
      {
        id: "first-class-cost",
        question: "How much does a first yoga class cost?",
        answer:
          "Drop-in classes typically cost between 15 and 30 US dollars in large cities, and many studios offer a discounted first class or an introductory week. Donation-based classes exist in most cities too. Intro offers are usually the cheapest way to try several teachers before committing to one.",
        health: false,
      },
      {
        id: "which-time",
        question: "Is it better to do yoga in the morning or evening?",
        answer:
          "The best time is the one you will keep. Morning classes tend to be quieter and stiffer-bodied; evening classes are busier and warmer-muscled. There is no meaningful performance difference for beginners — schedule reliability predicts whether you continue far better than the hour on the clock.",
        health: false,
      },
      {
        id: "home-or-studio",
        question: "Should beginners start at home or in a studio?",
        answer:
          "Start in a studio if you can. A teacher who can see you corrects small errors before they become habits, which videos cannot do. Once you know eight or ten poses well, home practice between classes works beautifully. Online live classes are a reasonable middle ground.",
        health: false,
      },
      {
        id: "what-is-namaste",
        question: "What should you say and do at the end of class?",
        answer:
          "Follow the room. Many teachers close with a short seated moment and the word namaste, which the class may repeat; joining in is welcome and staying silent is fine. There is no ritual knowledge required — courtesy and quiet during the final rest are the entire etiquette.",
        health: false,
      },
    ],
    sources: [
      {
        url: "https://www.yogaalliance.org/2016yogainamericastudy",
        publication: "Yoga Alliance / Yoga Journal",
        author: "Yoga Alliance",
        publishedYear: 2016,
        dateAccessed: "2026-07-25",
        claim: "Practice frequency norms among US practitioners.",
        archiveUrl: "https://web.archive.org/web/2026/https://www.yogaalliance.org/2016yogainamericastudy",
      },
      {
        url: "https://www.nccih.nih.gov/health/yoga-what-you-need-to-know",
        publication: "NIH National Center for Complementary and Integrative Health",
        author: "NCCIH",
        publishedYear: 2023,
        dateAccessed: "2026-07-25",
        claim: "General safety profile of yoga for healthy adults.",
        archiveUrl: "https://web.archive.org/web/2026/https://www.nccih.nih.gov/health/yoga-what-you-need-to-know",
      },
      {
        url: "https://www.acsm.org/education-resources/trending-topics-resources/physical-activity-guidelines",
        publication: "American College of Sports Medicine",
        author: "ACSM",
        publishedYear: 2024,
        dateAccessed: "2026-07-25",
        claim: "Consistency over volume in establishing exercise habits.",
        archiveUrl: null,
      },
    ],
    related: [
      { href: "/directory", anchor: "Find a beginner class near you" },
      { href: "/blog/styles", anchor: "The eleven yoga styles, honestly described" },
      { href: "/blog/first", anchor: "Your first class, minute by minute" },
    ],
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    dateReviewed: PUBLISHED,
    nextReviewDue: EVERGREEN_REVIEW,
    aiAssisted: true,
  },

  {
    slug: "yoga-teacher-training-guide",
    title: "What should you know before choosing a yoga teacher training?",
    format: "pillar",
    clusterId: "teacher-training",
    state: "published",
    authorSlug: "mara-ellison",
    reviewerSlug: null,
    reviewTier: "none",
    answerBlock:
      "A yoga teacher training (YTT) is a structured course in teaching methodology, anatomy, philosophy and practice, most commonly 200 hours long. Choose by the lead teachers' experience and the syllabus, not the venue. Expect to pay 1,500 to 4,500 US dollars for a 200-hour course, more for residential intensives.",
    disclaimer: "none",
    excerpt:
      "200 versus 300 hours, what accreditation actually means, what it costs, and the questions schools hope you won't ask.",
    minutes: 13,
    tint: "#fbac49",
    topics: ["teacher-training"],
    sections: [
      {
        heading: "What is the difference between 200, 300 and 500-hour trainings?",
        paragraphs: [
          "The 200-hour course is the entry credential and covers foundations: asana technique, basic anatomy, sequencing, philosophy and supervised teaching practice. A 300-hour course is advanced study taken afterwards, and 500 hours simply denotes the two combined. No jurisdiction legally requires any of them to teach — the hours system is a registry convention, not a licence.",
        ],
        table: {
          headers: ["Training", "Typical length", "Typical cost (USD)", "What it is for"],
          rows: [
            ["200-hour", "3 weeks intensive or 3–6 months part-time", "$1,500–4,500", "Foundation: begin teaching group classes"],
            ["300-hour", "1–12 months", "$2,500–6,000", "Advanced study after a 200-hour course"],
            ["500-hour", "Combined designation", "Sum of both", "Registry designation for the two together"],
          ],
        },
      },
      {
        heading: "Does Yoga Alliance accreditation matter?",
        paragraphs: [
          "Less than schools imply. Yoga Alliance is a voluntary registry, not a regulator: an RYS badge means a school filed a syllabus that meets minimum hour allocations, and Yoga Alliance itself states that RYT registration is not a licence or government credential. Studios rarely check it; students almost never do. Treat the badge as a floor, then judge the school on the things the badge cannot show — who actually teaches the contact hours, and how much supervised practice teaching you get.",
          "Compare accredited [teacher training programmes](/directory?kind=training) side by side, and read schools' verified credentials on their profiles rather than their marketing pages.",
        ],
      },
      {
        heading: "What questions should you ask a school before paying a deposit?",
        paragraphs: [
          "Deposits on trainings are large and refund terms vary wildly, so interrogate the details the brochure omits.",
        ],
        list: {
          ordered: true,
          items: [
            "Who teaches the anatomy module, and what is their qualification beyond an RYT number?",
            "How many hours are supervised practice teaching, and how large are feedback groups?",
            "What is the refund ladder if you withdraw — and is the deposit protected before the course starts?",
            "How many graduates from the last cohort are teaching a year later?",
          ],
        },
      },
    ],
    faqs: [
      {
        id: "ytt-worth-it",
        question: "Is a 200-hour yoga teacher training worth it if you never teach?",
        answer:
          "Often, yes — roughly a third of trainees enrol to deepen their own practice rather than to work. The structured anatomy and philosophy study is hard to assemble from classes alone. Be honest about the goal though: a 3,000-dollar training is an expensive way to buy motivation.",
        health: false,
      },
      {
        id: "ytt-online",
        question: "Are online yoga teacher trainings legitimate?",
        answer:
          "They can be, and registries have permanently accepted online contact hours since 2023. The trade-off is real: adjustment skills and reading a room develop poorly over video. A hybrid course — online theory with in-person teaching practice — preserves the flexibility while protecting the skill that actually gets you hired.",
        health: false,
      },
      {
        id: "ytt-india",
        question: "Should you do your teacher training in India?",
        answer:
          "Training at the source appeals for good reasons: lineage teachers, immersion, and lower prices — Rishikesh courses often cost half their western equivalents. Quality varies enormously, so apply the same syllabus scrutiny you would anywhere. Read our honest guide to [Rishikesh](/places/rishikesh) before booking a flight.",
        health: false,
      },
      {
        id: "ytt-income",
        question: "How much do new yoga teachers earn?",
        answer:
          "Modestly, at first. Group classes commonly pay 30 to 75 US dollars each in large markets, and most new teachers assemble part-time schedules across several studios. Sustainable teaching incomes usually come from privates, workshops and retreats layered on top — treat the first year as an apprenticeship.",
        health: false,
      },
    ],
    sources: [
      {
        url: "https://www.yogaalliance.org/Credentialing/Credentials_for_Teachers",
        publication: "Yoga Alliance",
        author: "Yoga Alliance",
        publishedYear: 2025,
        dateAccessed: "2026-07-25",
        claim: "RYT is a registry designation, not a licence; RYS hour requirements.",
        archiveUrl: "https://web.archive.org/web/2026/https://www.yogaalliance.org/Credentialing/Credentials_for_Teachers",
      },
      {
        url: "https://www.yogaalliance.org/About_Yoga_Alliance/Policies/Online_Teaching_Policy",
        publication: "Yoga Alliance",
        author: "Yoga Alliance",
        publishedYear: 2023,
        dateAccessed: "2026-07-25",
        claim: "Permanent acceptance of online contact hours after the provisional period.",
        archiveUrl: null,
      },
      {
        url: "https://www.ibisworld.com/united-states/market-research-reports/pilates-yoga-studios-industry/",
        publication: "IBISWorld",
        author: "IBISWorld",
        publishedYear: 2025,
        dateAccessed: "2026-07-25",
        claim: "US studio industry size and instructor pay ranges.",
        archiveUrl: null,
      },
    ],
    related: [
      { href: "/directory?kind=training", anchor: "Compare teacher training programmes" },
      { href: "/places/rishikesh", anchor: "Rishikesh, honestly described" },
      { href: "/blog/teaching-yoga-as-a-business", anchor: "Teaching yoga as a business" },
    ],
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    dateReviewed: null,
    nextReviewDue: FAST_REVIEW,
    aiAssisted: true,
  },

  {
    slug: "yoga-retreat-guide",
    title: "How do you choose a yoga retreat that fits you?",
    format: "pillar",
    clusterId: "retreats",
    state: "published",
    authorSlug: "mara-ellison",
    reviewerSlug: null,
    reviewTier: "none",
    answerBlock:
      "A yoga retreat is a residential programme combining daily practice with accommodation and most meals, usually lasting three to seven nights. Choose by teacher and daily schedule first, destination second. Budget 800 to 2,500 US dollars for a week in Europe or Central America, excluding flights, and check the cancellation terms before paying a deposit.",
    disclaimer: "none",
    excerpt:
      "Teacher first, beach second. How to read a retreat listing, what deposits commit you to, and when going solo works.",
    minutes: 12,
    tint: "#ff6540",
    topics: ["retreat"],
    sections: [
      {
        heading: "What actually matters when comparing retreats?",
        paragraphs: [
          "The teacher and the daily rhythm shape your week far more than the villa photographs. Look for the real schedule — hours of practice per day, level assumptions, free time — and for how many guests share the teacher. A retreat listing that leads with the pool and buries the timetable is telling you its priorities. Our guide to [choosing a retreat you will actually enjoy](/blog/retreat) covers the questions that separate a practice week from a package holiday.",
        ],
        table: {
          headers: ["Retreat type", "Typical price (week)", "Best for"],
          rows: [
            ["Local weekend (2–3 nights)", "$300–700", "First retreat, testing the format"],
            ["European villa week", "$1,200–2,500", "Small groups, strong food, shoulder-season value"],
            ["Tropical destination week", "$800–2,000", "Winter sun, surf-and-yoga combinations"],
            ["Ashram or centre stay", "$300–900", "Austere schedules, study focus, solo travellers"],
          ],
        },
      },
      {
        heading: "What should you check before paying a retreat deposit?",
        paragraphs: [
          "Deposits are typically 20 to 30 percent and the balance falls due four to eight weeks before arrival. Read the refund ladder, confirm whether the deposit transfers to a future date if you cancel early, and check what happens if the organiser cancels. Comprehensive travel insurance that covers pre-paid activity holidays is worth the premium on any retreat costing four figures.",
          "Browse [retreats on The Yoga Universe](/directory?kind=retreat) — listings show verified organiser credentials, real schedules and, for US retreats, transparent booking terms with the cancellation policy saved on the booking.",
        ],
      },
      {
        heading: "Is it normal to go on a yoga retreat alone?",
        paragraphs: [
          "It is the norm, not the exception: organisers consistently report that the majority of their guests arrive solo, and the structure of shared meals and daily practice dissolves the awkwardness within a day. Choose a retreat with some shared-room options and communal dining if meeting people is part of the goal; choose private-room-only formats if solitude is.",
        ],
      },
    ],
    faqs: [
      {
        id: "retreat-level",
        question: "Do you need to be experienced to join a yoga retreat?",
        answer:
          "No — most retreats are deliberately all-levels, because filling a villa requires welcoming beginners. The listing will say if a retreat assumes a strong practice, and honest organisers state level expectations plainly. If you can manage two classes in a day at home, you can manage most retreat schedules.",
        health: false,
      },
      {
        id: "retreat-included",
        question: "What is usually included in a retreat price?",
        answer:
          "Accommodation, daily yoga, and most meals — typically brunch and dinner. Flights are almost never included; airport transfers, excursions, massages and alcohol usually cost extra. Read the inclusions list line by line and price the excluded items realistically before comparing two retreats on their headline number.",
        health: false,
      },
      {
        id: "retreat-когда",
        question: "When is the best time to book a retreat?",
        answer:
          "Three to six months out for popular teachers and school-holiday weeks, which genuinely sell out. Shoulder seasons — May to June and September to October in Europe — offer the best weather-to-price ratio. Last-minute discounts exist but are unreliable, and the remaining rooms are rarely the good ones.",
        health: false,
      },
      {
        id: "retreat-alone-safety",
        question: "How do you vet a retreat organiser you found online?",
        answer:
          "Look for a verifiable teaching history, named lead teachers with checkable credentials, reviews attached to real bookings rather than a testimonial page, and clear legal terms. On The Yoga Universe, organiser credentials carry a verification tier and reviews come only from verified attendees — marketing cannot buy either signal.",
        health: false,
      },
    ],
    sources: [
      {
        url: "https://www.gwi.org/reports/global-wellness-economy-monitor",
        publication: "Global Wellness Institute",
        author: "Global Wellness Institute",
        publishedYear: 2024,
        dateAccessed: "2026-07-25",
        claim: "Wellness tourism market size and growth of retreat travel.",
        archiveUrl: null,
      },
      {
        url: "https://www.abta.com/tips-and-advice/planning-and-booking-a-holiday/travel-insurance",
        publication: "ABTA",
        author: "ABTA",
        publishedYear: 2025,
        dateAccessed: "2026-07-25",
        claim: "Insurance guidance for pre-paid activity holidays.",
        archiveUrl: null,
      },
      {
        url: "https://www.condorferries.co.uk/solo-travel-statistics",
        publication: "Condor (travel statistics compilation)",
        author: "Condor Research",
        publishedYear: 2025,
        dateAccessed: "2026-07-25",
        claim: "Prevalence of solo travellers in group wellness travel.",
        archiveUrl: null,
      },
    ],
    related: [
      { href: "/directory?kind=retreat", anchor: "Browse retreats with verified organisers" },
      { href: "/blog/retreat", anchor: "How to choose a retreat you will actually enjoy" },
      { href: "/help/how-booking-works", anchor: "How booking works on The Yoga Universe" },
    ],
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    dateReviewed: null,
    nextReviewDue: FAST_REVIEW,
    aiAssisted: true,
  },

  {
    slug: "meditation-and-breathwork-guide",
    title: "What is the difference between meditation and breathwork?",
    format: "pillar",
    clusterId: "meditation-breathwork",
    state: "published",
    authorSlug: "mara-ellison",
    reviewerSlug: "leila-haddad",
    reviewTier: "clinical",
    answerBlock:
      "Meditation trains attention — observing thoughts, sensations or a fixed anchor without reacting. Breathwork actively manipulates breathing rhythm to change physical and mental state. Meditation techniques are broadly safe for most people; some breathwork protocols involve intensity that is not, so please consult your doctor before trying fast-breathing or breath-hold practices.",
    disclaimer: "standard",
    excerpt:
      "One trains attention, the other manipulates physiology. What the evidence supports, what it doesn't, and where to start safely.",
    minutes: 12,
    tint: "#a2d1a2",
    topics: ["mindfulness", "vipassana", "pranayama", "breathwork"],
    sections: [
      {
        heading: "What does the evidence actually say about meditation?",
        paragraphs: [
          "The strongest evidence base belongs to structured mindfulness programmes. A JAMA Internal Medicine meta-analysis (Goyal et al., 2014) of 47 trials found moderate evidence that mindfulness programmes improve anxiety, depression and pain — comparable in effect size to what would be expected from antidepressants in similar populations, though the authors stress the evidence quality is mixed. Grander claims about creativity, longevity or curing illness outrun the data.",
        ],
        qualifier:
          "Research on this is early and mixed — please consult your doctor about what is appropriate for you, particularly for anxiety or depression that affects daily life.",
      },
      {
        heading: "Which meditation technique should you start with?",
        paragraphs: [
          "Start with guided breath-anchored mindfulness in ten-minute sessions: it is the most taught, the easiest to learn badly and then correct, and the technique behind most of the research. From there the traditions diverge — [mindfulness and vipassana](/directory?styles=mindfulness) teachers work with open awareness, mantra traditions use repetition, and yoga nidra is a guided, lying-down practice closer to systematic rest.",
          "A live teacher accelerates all of it. Browse [meditation teachers](/directory?kind=meditation) whose lineage and training are verified rather than asserted.",
        ],
      },
      {
        heading: "What should you know before trying breathwork?",
        paragraphs: [
          "Slow-paced breathing — extending the exhale, breathing around six breaths per minute — reliably downregulates the stress response and is safe for nearly everyone. Fast-paced protocols and long breath-holds (hyperventilation-based methods, some kundalini and holotropic styles) produce intense physical sensations including tingling, dizziness and occasionally fainting.",
          "Read [breathwork is not one thing](/blog/breath) before choosing a class, and treat any teacher who promises clinical outcomes from a weekend workshop with suspicion.",
        ],
        qualifier:
          "Fast-breathing and breath-hold practices carry specific risks and are not suitable for everyone. Please consult your doctor before trying them, particularly with cardiovascular conditions, epilepsy, pregnancy, or a history of fainting.",
      },
    ],
    faqs: [
      {
        id: "how-long-meditate",
        question: "How long should a beginner meditate each day?",
        answer:
          "Ten minutes daily beats an hour weekly. The habit-formation research and most teachers converge on the same advice: small, consistent sessions at a fixed time. Extend the sitting only when ten minutes feels genuinely short. Apps are fine scaffolding, though a live teacher corrects technique they cannot see.",
        health: false,
      },
      {
        id: "meditation-anxiety",
        question: "Can meditation help with anxiety?",
        answer:
          "Structured mindfulness programmes show moderate evidence of reducing anxiety symptoms (Goyal et al., JAMA Internal Medicine, 2014). It is a support, not a treatment — research on this is mixed, so please consult your doctor if anxiety is affecting daily life, and treat meditation as a complement to care, not a substitute.",
        health: true,
      },
      {
        id: "breathwork-safe",
        question: "Is breathwork safe to do at home?",
        answer:
          "Slow-paced breathing at home is safe for nearly everyone. Fast-breathing and breath-hold protocols are different: never practise them in water, standing, or while driving, because fainting is a documented risk. This practice is not suitable for everyone — please consult your doctor first if you have cardiovascular conditions, epilepsy, or are pregnant.",
        health: true,
      },
      {
        id: "meditation-vs-nidra",
        question: "Is yoga nidra the same as meditation?",
        answer:
          "No. Yoga nidra is a guided, lying-down practice that systematically rotates attention through the body toward deep rest — you follow a voice throughout. Seated meditation trains self-directed attention. Nidra suits exhausted beginners precisely because it demands so little; many people use it as a doorway into seated practice.",
        health: false,
      },
      {
        id: "which-class-first",
        question: "Should you learn meditation or breathwork in a class first?",
        answer:
          "Meditation can be safely self-taught from recordings; a class mainly adds accountability and posture corrections. Breathwork benefits more from live instruction, because pacing errors are invisible to you and obvious to a teacher. For fast-paced protocols specifically, a screened, in-person setting with a credentialed teacher is the sensible route.",
        health: false,
      },
    ],
    sources: [
      {
        url: "https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/1809754",
        publication: "JAMA Internal Medicine",
        author: "Goyal M, Singh S, Sibinga EMS, et al.",
        publishedYear: 2014,
        dateAccessed: "2026-07-25",
        claim: "Moderate evidence for mindfulness programmes on anxiety, depression and pain across 47 trials.",
        archiveUrl: "https://web.archive.org/web/2026/https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/1809754",
      },
      {
        url: "https://www.frontiersin.org/articles/10.3389/fnhum.2018.00353/full",
        publication: "Frontiers in Human Neuroscience",
        author: "Zaccaro A, Piarulli A, Laurino M, et al.",
        publishedYear: 2018,
        dateAccessed: "2026-07-25",
        claim: "Slow-paced breathing (~6 breaths/min) and parasympathetic activation.",
        archiveUrl: null,
      },
      {
        url: "https://www.nccih.nih.gov/health/meditation-and-mindfulness-what-you-need-to-know",
        publication: "NIH National Center for Complementary and Integrative Health",
        author: "NCCIH",
        publishedYear: 2024,
        dateAccessed: "2026-07-25",
        claim: "Overall evidence quality and safety considerations for meditation practices.",
        archiveUrl: null,
      },
    ],
    related: [
      { href: "/directory?kind=meditation", anchor: "Find a meditation teacher" },
      { href: "/directory?kind=breathwork", anchor: "Breathwork classes with verified teachers" },
      { href: "/blog/breath", anchor: "Breathwork is not one thing" },
    ],
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    dateReviewed: PUBLISHED,
    nextReviewDue: EVERGREEN_REVIEW,
    aiAssisted: true,
  },

  {
    slug: "yoga-safety-guide",
    title: "Is yoga safe, and who should modify their practice?",
    format: "pillar",
    clusterId: "safety-accessibility",
    state: "published",
    authorSlug: "mara-ellison",
    reviewerSlug: "leila-haddad",
    reviewTier: "clinical",
    answerBlock:
      "Yoga is low-risk for most healthy adults: injury rates are comparable to other moderate exercise, mostly strains from overreaching. Higher-risk situations are pregnancy, recent injury or surgery, glaucoma, uncontrolled blood pressure, and hypermobility. Please consult your doctor before starting if any apply — then choose classes and teachers equipped for your situation.",
    disclaimer: "standard",
    excerpt:
      "Honest risk numbers, the poses that cause most trouble, and how to practise with injury, pregnancy or hypermobility.",
    minutes: 14,
    tint: "#f0f6f0",
    topics: ["yin", "restorative", "prenatal", "adaptive"],
    sections: [
      {
        heading: "How common are yoga injuries really?",
        paragraphs: [
          "Rare, and mostly minor. A large cross-sectional analysis in the Orthopaedic Journal of Sports Medicine (2016) using US emergency-department data found yoga injury rates far below contact sports and comparable to other low-impact exercise, with sprains and strains dominating and older beginners at somewhat higher risk. The pattern in clinical practice is consistent: trouble comes from overreaching into flexibility the body does not yet have, usually in hamstrings, lower back and neck.",
        ],
        qualifier:
          "If you are recovering from injury or surgery, research on safe return-to-practice timing is limited — please consult your doctor or physiotherapist about what is appropriate for you.",
      },
      {
        heading: "How should you practise during pregnancy?",
        paragraphs: [
          "With a specifically prenatal class, not a gentler version of a general one. Prenatal sequencing avoids prolonged lying on the back after the first trimester, deep closed twists, strong core compression and breath retention — and a [prenatal-trained teacher](/directory?styles=prenatal) knows why, trimester by trimester. Major obstetric bodies including ACOG endorse appropriately modified yoga during uncomplicated pregnancy.",
        ],
        qualifier:
          "Every pregnancy is different. Please consult your doctor or midwife before starting or continuing yoga while pregnant, especially with any complication or restriction.",
      },
      {
        heading: "What does accessible and adaptive yoga look like?",
        paragraphs: [
          "Chair yoga, adaptive classes and slower formats like [yin](/directory?styles=yin) and [restorative](/directory?styles=restorative) make practice available across mobility levels, and good adaptive teachers treat props as tools rather than concessions. Hypermobile practitioners need the opposite of flexibility work — stability and end-range control — and benefit from teachers who cue engagement over depth.",
          "When a listing mentions injury-aware or adaptive teaching, check the teacher's actual training on their profile. Credentials on The Yoga Universe are [verified in tiers](/help/verification), so 'trauma-informed' and 'adaptive-trained' mean documents, not vocabulary.",
        ],
      },
    ],
    faqs: [
      {
        id: "back-pain",
        question: "Can you do yoga with lower back pain?",
        answer:
          "Often yes, with the right class — gentle, slow formats with a teacher who knows your situation. Some trial evidence supports yoga easing chronic low-back pain modestly, but research is mixed and flare-ups happen. Please consult your doctor or physiotherapist first, and tell the teacher before class begins.",
        health: true,
      },
      {
        id: "hot-yoga-safe",
        question: "Is hot yoga safe?",
        answer:
          "For healthy, hydrated adults, generally yes, though heat adds real cardiovascular load and masks overstretching. It is not suitable for everyone — please consult your doctor before trying it if you are pregnant, have cardiovascular conditions or blood-pressure issues, or take medication affecting heat regulation.",
        health: true,
      },
      {
        id: "inversions",
        question: "Who should avoid headstands and inversions?",
        answer:
          "Full inversions load the neck and raise intraocular pressure, so they are commonly avoided with glaucoma, uncontrolled hypertension, and recent neck injury. These practices carry specific risks and are not suitable for everyone — please consult your doctor first, and treat legs-up-the-wall as the inversion that gives most of the benefit with little of the risk.",
        health: true,
      },
      {
        id: "hypermobile",
        question: "Is yoga good or bad for hypermobility?",
        answer:
          "Both, depending on how it is taught. Chasing range in already-lax joints invites instability injuries; strength-focused, alignment-precise practice builds the control hypermobile bodies lack. Look for teachers who cue engagement rather than depth, and please consult your doctor or physiotherapist if you have a hypermobility syndrome diagnosis.",
        health: true,
      },
      {
        id: "tell-teacher",
        question: "Should you tell a yoga teacher about an injury?",
        answer:
          "Always, before class, briefly and specifically: what hurts, what movements you are avoiding. Good teachers adjust quietly and appreciate the information; teachers who wave it off are telling you something important. On retreats and courses, health intake forms exist precisely so the teaching can be planned around your situation.",
        health: false,
      },
    ],
    sources: [
      {
        url: "https://journals.sagepub.com/doi/10.1177/2325967116671703",
        publication: "Orthopaedic Journal of Sports Medicine",
        author: "Swain TA, McGwin G",
        publishedYear: 2016,
        dateAccessed: "2026-07-25",
        claim: "US emergency-department yoga injury rates and patterns, 2001–2014.",
        archiveUrl: null,
      },
      {
        url: "https://www.acog.org/womens-health/faqs/exercise-during-pregnancy",
        publication: "American College of Obstetricians and Gynecologists",
        author: "ACOG",
        publishedYear: 2024,
        dateAccessed: "2026-07-25",
        claim: "Modified yoga endorsed during uncomplicated pregnancy; supine and overheating cautions.",
        archiveUrl: "https://web.archive.org/web/2026/https://www.acog.org/womens-health/faqs/exercise-during-pregnancy",
      },
      {
        url: "https://www.nccih.nih.gov/health/yoga-what-you-need-to-know",
        publication: "NIH NCCIH",
        author: "NCCIH",
        publishedYear: 2023,
        dateAccessed: "2026-07-25",
        claim: "Mixed evidence on yoga for chronic low-back pain; general safety guidance.",
        archiveUrl: null,
      },
    ],
    related: [
      { href: "/directory?styles=prenatal", anchor: "Prenatal-trained teachers" },
      { href: "/directory?styles=restorative", anchor: "Restorative and gentle classes" },
      { href: "/blog/props", anchor: "Buy two blocks before you buy anything else" },
    ],
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    dateReviewed: PUBLISHED,
    nextReviewDue: EVERGREEN_REVIEW,
    aiAssisted: true,
  },

  {
    slug: "teaching-yoga-as-a-business",
    title: "How do yoga teachers actually make a living?",
    format: "pillar",
    clusterId: "teaching-business",
    state: "published",
    authorSlug: "koji-yamada",
    reviewerSlug: null,
    reviewTier: "none",
    answerBlock:
      "Most working yoga teachers assemble an income from several streams: studio classes as the visible base, then private sessions, workshops, retreats and corporate work, which pay far better per hour. Teachers who treat visibility as infrastructure — a claimed, credentialed public profile with accurate schedules — convert search interest into students that studios alone never send.",
    disclaimer: "none",
    excerpt:
      "The income mix behind sustainable teaching, what each stream pays, and why your public profile is business infrastructure.",
    minutes: 10,
    tint: "#fbac49",
    topics: ["teacher-training"],
    sections: [
      {
        heading: "What does each teaching income stream pay?",
        paragraphs: [
          "Group classes anchor a schedule but rarely a livelihood: industry surveys put typical per-class pay at 30 to 75 US dollars in large markets. The streams above them scale differently.",
        ],
        table: {
          headers: ["Stream", "Typical rate (US)", "Notes"],
          rows: [
            ["Studio group class", "$30–75 per class", "Visibility and student pipeline; capped hours"],
            ["Private sessions", "$75–200 per hour", "Highest hourly; grows from group students"],
            ["Workshops", "$300–1,500 per event", "Depth topics; splits with the venue"],
            ["Retreats", "$2,000–10,000 per week", "Highest revenue, highest organising risk"],
            ["Corporate classes", "$100–300 per session", "Daytime hours, reliable invoicing"],
          ],
        },
      },
      {
        heading: "Why does a public profile matter more than a following?",
        paragraphs: [
          "Students search when they need something — a specialist teacher, a Tuesday evening class, an Ashtanga room near work — and an accurate, credentialed profile is what search surfaces. Social following is rented attention; a profile with verified credentials, a live schedule and reviews from real bookings is owned infrastructure that compounds.",
          "If you already teach, your profile may exist on The Yoga Universe as seeded index data. [Claiming it](/help/verification) takes minutes, is free, and puts your schedule, credentials and contact details under your control — students find [teachers in the directory](/directory) whether or not the information is right, so make it right.",
        ],
      },
      {
        heading: "What business basics do new teachers skip?",
        paragraphs: [
          "The unglamorous ones: liability insurance appropriate to your jurisdiction, contracts for privates and corporate work, records for tax, and a cancellation policy stated before money changes hands. None of it is difficult; all of it separates a practice from a hobby. Teachers running retreats add deposit protection and clear refund ladders — the organisers with durable reputations are the ones whose terms read plainly.",
        ],
      },
    ],
    faqs: [
      {
        id: "full-time-feasible",
        question: "Can you teach yoga full-time?",
        answer:
          "Yes, but rarely on group classes alone. Sustainable full-time teachers typically mix fifteen or so group classes with privates, a workshop most months, and a retreat or corporate contract each year. Most give it two to three years of part-time building before the mix supports full-time hours.",
        health: false,
      },
      {
        id: "how-many-classes",
        question: "How many classes a week can a teacher sustainably teach?",
        answer:
          "Experienced teachers converge on twelve to eighteen group classes weekly as the ceiling before quality and voice degrade — teaching is physical work layered on demonstration and commuting. The economics push the same direction: replacing two group classes with one private usually raises income and lowers load.",
        health: false,
      },
      {
        id: "claim-profile",
        question: "What does claiming a profile on The Yoga Universe actually change?",
        answer:
          "Control and evidence. You correct your schedule, styles and contact details, attach verifiable credentials, and see how often searches surface your page and how many people contact you from it. Claiming is free — the index lists teachers either way, so the choice is whether the listing is accurate.",
        health: false,
      },
      {
        id: "insurance-needed",
        question: "Do yoga teachers need liability insurance?",
        answer:
          "In practice, yes — most studios require proof of cover before you teach, and privates in your own space carry the same exposure without the studio's policy behind you. Costs are modest relative to a single claim. Requirements vary by country and state, so check your jurisdiction and any venue contract.",
        health: false,
      },
    ],
    sources: [
      {
        url: "https://www.ibisworld.com/united-states/market-research-reports/pilates-yoga-studios-industry/",
        publication: "IBISWorld",
        author: "IBISWorld",
        publishedYear: 2025,
        dateAccessed: "2026-07-25",
        claim: "US studio industry structure and instructor pay ranges.",
        archiveUrl: null,
      },
      {
        url: "https://www.bls.gov/ooh/personal-care-and-service/fitness-trainers-and-instructors.htm",
        publication: "US Bureau of Labor Statistics",
        author: "BLS",
        publishedYear: 2025,
        dateAccessed: "2026-07-25",
        claim: "Median pay and employment outlook for fitness instructors, the closest tracked category.",
        archiveUrl: "https://web.archive.org/web/2026/https://www.bls.gov/ooh/personal-care-and-service/fitness-trainers-and-instructors.htm",
      },
      {
        url: "https://www.yogaalliance.org/2016yogainamericastudy",
        publication: "Yoga Alliance / Yoga Journal",
        author: "Yoga Alliance",
        publishedYear: 2016,
        dateAccessed: "2026-07-25",
        claim: "Teacher population and practitioner spending patterns.",
        archiveUrl: null,
      },
    ],
    related: [
      { href: "/directory", anchor: "See how teachers appear in the directory" },
      { href: "/help/verification", anchor: "How credential verification works" },
      { href: "/blog/yoga-teacher-training-guide", anchor: "Choosing a teacher training" },
    ],
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    dateReviewed: null,
    nextReviewDue: EVERGREEN_REVIEW,
    aiAssisted: true,
  },

  {
    slug: "where-to-practice-yoga",
    title: "Where are the best places in the world to practise yoga?",
    format: "pillar",
    clusterId: "city-destination-guides",
    state: "published",
    authorSlug: "mara-ellison",
    reviewerSlug: null,
    reviewTier: "none",
    answerBlock:
      "The best place to practise yoga depends on what you want from it: dense studio scenes and famous teachers in cities like New York, Los Angeles and London; immersion and lineage study in Rishikesh or Mysore, India; and retreat-centred practice in Bali, Costa Rica and coastal Portugal. Strong teaching exists in every major city.",
    disclaimer: "none",
    excerpt:
      "City scenes, source traditions and retreat coasts — what each kind of yoga destination is actually good at.",
    minutes: 11,
    tint: "#a2d1a2",
    topics: ["retreat", "ashtanga", "hatha"],
    sections: [
      {
        heading: "Which cities have the strongest yoga scenes?",
        paragraphs: [
          "Scale and specialisation travel together. [New York](/us/new-york/yoga) offers every lineage within subway distance and the deepest bench of senior teachers in the US; [Los Angeles](/us/los-angeles/yoga) leads on movement innovation and outdoor practice; London anchors Europe's scene with strong Iyengar and Ashtanga rooms. What a big-city scene really buys you is choice — of teacher, level, hour and price — which is exactly what a first year of practice needs.",
          "Smaller scenes reward differently: [Austin](/us/austin/yoga) and Portland trade breadth for community, and shoulder-season classes in southern European cities cost half their London equivalents.",
        ],
      },
      {
        heading: "Is it worth travelling to India to study yoga?",
        paragraphs: [
          "For immersion in the source traditions, nothing substitutes. [Rishikesh](/places/rishikesh) concentrates ashrams, teacher trainings and daily-practice culture on the Ganges; Mysore remains the home of Ashtanga's morning-practice tradition. Go with realistic expectations — quality varies as much as anywhere, and the same school-vetting questions apply with extra force where marketing outruns regulation.",
        ],
      },
      {
        heading: "Where should you go for a retreat-centred trip?",
        paragraphs: [
          "Three coasts dominate for good reasons. Bali combines teacher density with low costs and a year-round season; Costa Rica pairs surf with a mature retreat infrastructure; Portugal's Alentejo and Algarve offer Europe's best value-to-weather ratio outside July and August. Compare [retreats](/directory?kind=retreat) by teacher and schedule before destination — a strong week with the right teacher in a modest venue beats a beautiful villa with anonymous teaching.",
        ],
      },
    ],
    faqs: [
      {
        id: "best-us-city",
        question: "Which US city is best for yoga?",
        answer:
          "New York for depth and lineage teachers, Los Angeles for innovation and outdoor practice, and honourable mentions to San Francisco, Austin and Boulder for scenes larger than their populations suggest. Best is personal: match the city's dominant styles to yours using each city's hub page before assuming bigger is better.",
        health: false,
      },
      {
        id: "yoga-capital",
        question: "Why is Rishikesh called the yoga capital of the world?",
        answer:
          "Concentration and history: ashrams and schools line the Ganges where the Beatles studied in 1968, the town hosts the International Yoga Festival, and daily practice saturates ordinary life. It earns the title on density rather than exclusivity — serious study happens in Mysore, Chennai and beyond too.",
        health: false,
      },
      {
        id: "cheap-destinations",
        question: "Where can you practise yoga cheaply abroad?",
        answer:
          "India remains the outlier: drop-in classes and ashram stays cost a fraction of western prices. Bali, Thailand and Guatemala offer strong retreat value; in Europe, Portugal and Greece undercut the north meaningfully. Everywhere, donation-based classes and community studios exist — city hub pages list them alongside premium options.",
        health: false,
      },
      {
        id: "online-good-enough",
        question: "Is travelling for yoga necessary at all?",
        answer:
          "No. Online live classes put senior teachers in your living room, and every sizeable city has honest, skilled teaching. Travel adds immersion and removal from routine — valuable, not essential. The practice is portable by design; the destination is an amplifier, never a requirement.",
        health: false,
      },
    ],
    sources: [
      {
        url: "https://www.gwi.org/reports/global-wellness-economy-monitor",
        publication: "Global Wellness Institute",
        author: "Global Wellness Institute",
        publishedYear: 2024,
        dateAccessed: "2026-07-25",
        claim: "Wellness tourism flows by region.",
        archiveUrl: null,
      },
      {
        url: "https://uttarakhandtourism.gov.in/destination/rishikesh",
        publication: "Uttarakhand Tourism",
        author: "Government of Uttarakhand",
        publishedYear: 2025,
        dateAccessed: "2026-07-25",
        claim: "Rishikesh ashram and festival infrastructure.",
        archiveUrl: null,
      },
      {
        url: "https://www.yogaalliance.org/2016yogainamericastudy",
        publication: "Yoga Alliance / Yoga Journal",
        author: "Yoga Alliance",
        publishedYear: 2016,
        dateAccessed: "2026-07-25",
        claim: "US practitioner distribution underpinning city-scene comparisons.",
        archiveUrl: null,
      },
    ],
    related: [
      { href: "/us/new-york/yoga", anchor: "Yoga in New York" },
      { href: "/places/rishikesh", anchor: "Rishikesh, honestly described" },
      { href: "/directory?kind=retreat", anchor: "Retreats by destination" },
    ],
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    dateReviewed: null,
    nextReviewDue: FAST_REVIEW,
    aiAssisted: true,
  },
];
