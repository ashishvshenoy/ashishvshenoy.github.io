window.SVGS = {
  pacifier: `
  <svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="220" rx="18" fill="#fff"/>
    <g transform="translate(70,30)">
      <circle cx="180" cy="90" r="78" fill="#ffd6e7"/>
      <circle cx="180" cy="90" r="52" fill="#ffffff"/>
      <rect x="250" y="76" width="160" height="28" rx="14" fill="#c7d2fe"/>
      <rect x="390" y="62" width="50" height="56" rx="14" fill="#a5b4fc"/>
      <circle cx="180" cy="90" r="18" fill="#a5b4fc"/>
      <text x="10" y="170" font-size="18" font-family="Arial" fill="#6b7280">Picture This!</text>
    </g>
  </svg>`,
  bottle: `
  <svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="220" rx="18" fill="#fff"/>
    <g transform="translate(250,20)">
      <rect x="20" y="12" width="60" height="40" rx="14" fill="#c7d2fe"/>
      <rect x="10" y="45" width="80" height="150" rx="26" fill="#ffd6e7"/>
      <rect x="25" y="70" width="50" height="95" rx="16" fill="#fff"/>
      <path d="M10,70 H90" stroke="#a5b4fc" stroke-width="6"/>
      <path d="M10,100 H90" stroke="#a5b4fc" stroke-width="6"/>
      <path d="M10,130 H90" stroke="#a5b4fc" stroke-width="6"/>
      <text x="-220" y="200" font-size="18" font-family="Arial" fill="#6b7280">What item is this?</text>
    </g>
  </svg>`,
  diaper: `
  <svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="220" rx="18" fill="#fff"/>
    <g transform="translate(130,35)">
      <path d="M40 30 Q170 0 300 30 L330 150 Q170 200 10 150 Z" fill="#e5e7eb"/>
      <path d="M95 55 Q170 30 245 55" stroke="#9ca3af" stroke-width="6" fill="none"/>
      <circle cx="75" cy="120" r="12" fill="#a5b4fc"/>
      <circle cx="285" cy="120" r="12" fill="#a5b4fc"/>
      <text x="0" y="185" font-size="18" font-family="Arial" fill="#6b7280">Name it!</text>
    </g>
  </svg>`,
  onesie: `
  <svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="220" rx="18" fill="#fff"/>
    <g transform="translate(225,18)">
      <path d="M40 30 Q80 0 120 30 L150 60 L120 85 L120 170 Q80 200 40 170 Z" fill="#c7d2fe"/>
      <path d="M40 30 Q80 0 120 30" stroke="#a5b4fc" stroke-width="6" fill="none"/>
      <circle cx="60" cy="168" r="6" fill="#111827"/>
      <circle cx="80" cy="172" r="6" fill="#111827"/>
      <circle cx="100" cy="168" r="6" fill="#111827"/>
      <text x="-180" y="205" font-size="18" font-family="Arial" fill="#6b7280">What is this baby outfit?</text>
    </g>
  </svg>`,
  stroller: `
  <svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="220" rx="18" fill="#fff"/>
    <g transform="translate(140,35)">
      <circle cx="80" cy="150" r="18" fill="#111827"/>
      <circle cx="240" cy="150" r="18" fill="#111827"/>
      <path d="M60 145 H260" stroke="#6b7280" stroke-width="8"/>
      <path d="M95 145 L140 70 Q210 40 260 90 L260 145" fill="#ffd6e7" stroke="#a5b4fc" stroke-width="6"/>
      <path d="M140 70 L120 30" stroke="#111827" stroke-width="6"/>
      <text x="0" y="185" font-size="18" font-family="Arial" fill="#6b7280">What do you call this?</text>
    </g>
  </svg>`
};

// Default questions (editable in the in-app editor)
// Each round: 4 categories, 2 clues each. Supports imageUrl (web OR local) + trickyImage/trickyZoom.
// To use a local image: set imageUrl to something like "assets/images/myphoto.jpg" (relative path).

window.DEFAULT_ROUNDS = [
  {
    "id": "R1",
    "name": "Round 1",
    "categories": [
      {
        "name": "Baby Science & Stats",
        "clues": [
          {
            "value": 100,
            "q": "Roughly how many diapers does a baby use in their first year?",
            "a": "About 2,500–3,000"
          },
          {
            "value": 200,
            "q": "How often do newborns typically eat in a 24-hour period?",
            "a": "8–12 times"
          }
        ]
      },
      {
        "name": "Safety First",
        "clues": [
          {
            "value": 100,
            "q": "The safe sleep ABCs stand for: Alone, Back, and ____.",
            "a": "Crib (or another firm, flat sleep surface)."
          },
          {
            "value": 200,
            "q": "What’s the safest position for a baby to sleep in?",
            "a": "On their back"
          }
        ]
      },
      {
        "name": "Picture This: Zoomed In",
        "clues": [
          {
            "value": 100,
            "q": "Name this item (bonus: what is it used for?).",
            "a": "Nasal aspirator",
            "imageUrl": "assets/images/nasal_aspirator.jpg",
            "trickyImage": true,
            "trickyZoom": true
          },
          {
            "value": 200,
            "q": "Name this item (bonus: what is it used for?).",
            "a": "Sleep sack",
            "imageUrl": "assets/images/sleep_sack.png",
            "trickyImage": true,
            "trickyZoom": true
          }
        ]
      },
      {
        "name": "Pop Culture Parents",
        "clues": [
          {
            "value": 100,
            "q": "This show features two Australian heelers. Name the show AND the dad’s name (2-part).",
            "a": "Bluey; Dad is Bandit",
            "imageUrl": "assets/images/bluey_dad.jpg",
            "trickyImage": true,
            "trickyZoom": true
          },
          {
            "value": 200,
            "q": "In a popular sitcom, this character is a dad of these two kids. Name the show AND the character (2-part).",
            "a": "Ross; Friends",
            "imageUrl": "assets/images/emma_ross.png",
            "trickyImage": true,
            "trickyZoom": true
          }
        ]
      }
    ]
  },
  {
    "id": "R2",
    "name": "Round 2",
    "categories": [
      {
        "name": "Parenting Around the World",
        "clues": [
          {
            "value": 100,
            "q": "In which country do babies often nap outside in strollers, even in freezing weather?",
            "a": "Finland (also common in Denmark, Norway, Sweden)"
          },
          {
            "value": 200,
            "q": "In India, what is the purpose of placing a small black dot (kajal/teeka) on a baby’s face?",
            "a": "To protect the baby from the evil eye"
          }
        ]
      },
      {
        "name": "Real or Fake",
        "clues": [
          {
            "value": 100,
            "q": "Babies can smell their parents from across a room within days of being born.",
            "a": "REAL. Babies recognize their caregiver’s scent very early — it’s one of their strongest senses."
          },
          {
            "value": 200,
            "q": "Putting butter on a baby’s gums helps soothe teething pain",
            "a": "Fake."
          }
        ]
      },
      {
        "name": "Picture This: What Is It?",
        "clues": [
          {
            "value": 100,
            "q": "Name this item (bonus: what is it used for?).",
            "a": "Digital thermometer",
            "imageUrl": "assets/images/baby_therm.jpg",
            "trickyImage": true,
            "trickyZoom": true
          },
          {
            "value": 200,
            "q": "Name this item (bonus: what is it used for?).",
            "a": "White-noise machine",
            "imageUrl": "assets/images/white_noise.jpg",
            "trickyImage": true,
            "trickyZoom": true
          }
        ]
      },
      {
        "name": "Pop Culture Babies",
        "clues": [
          {
            "value": 100,
            "q": "In The Incredibles, what is the baby’s name?",
            "a": "Jack-Jack",
            "imageUrl": "assets/images/jack_jack.jpg",
            "trickyImage": true,
            "trickyZoom": true
          },
          {
            "value": 200,
            "q": "Name the movie and the main characters name (2-part).",
            "a": "Baby's Day Out; Bink!",
            "imageUrl": "assets/images/bdo.jpg",
            "trickyImage": true,
            "trickyZoom": true
          }
        ]
      }
    ]
  },
  {
    "id": "R3",
    "name": "Round 3",
    "categories": [
      {
        "name": "Rhymes!",
        "clues": [
          {
            "value": 100,
            "q": "Name the nursery rhyme from the audio and complete it.",
            "a": "Row, Row, Row Your Boat",
            "audioUrl": "assets/audio/row-row-row.mp3"
          },
          {
            "value": 200,
            "q": "Name the nursery rhyme from the audio and complete it.",
            "a": "Hickory Dickory Dock",
            "audioUrl": "assets/audio/hickoryDickoryDock.mp3"
          }
        ]
      },
      {
        "name": "Pop Culture Babies",
        "clues": [
          {
            "value": 100,
            "q": "Although fans nicknamed him Baby Yoda, this 50-year-old infant’s actual name was revealed in Season 2 of The Mandalorian. What is it?",
            "a": "Grogu",
            "imageUrl": "assets/images/baby_yoda.jpg",
          },
          {
            "value": 200,
            "q": "We all know Mufasa and Sarabi are Simba’s parents. But this feisty cub is the daughter of a lioness named Sarafina. What is the name of this baby cub?",
            "a": "Nala",
            "imageUrl": "assets/images/nala.jpg",
          }
        ]
      },
      {
        "name": "Picture This!",
        "clues": [
          {
            "value": 100,
            "q": "Name this item",
            "a": "Teething Mitten",
            "imageUrl": "assets/images/mitten.png",
            "trickyImage": true,
            "trickyZoom": true
          },
          {
            "value": 200,
            "q": "Name this item",
            "a": "Baby Nail Filer Disc",
            "imageUrl": "assets/images/baby_nail_filer.jpg",
            "trickyImage": true,
            "trickyZoom": true
          }
        ]
      },
      {
        "name": "Emoji Translation",
        "clues": [
          {
            "value": 100,
            "q": "👶 🦈 🎶 👶 🦈 🎶 👶 🦈 🎶",
            "a": "Baby Shark!",
            "audioUrl": "assets/audio/baby-shark-remix-fire-hot.mp3"
          },
          {
            "value": 200,
            "q": "✨ ✨ 🤏 🌟 ❓ ☝️ 🌍 💎”",
            "a": "Twinkle Twinkle Little Star",
          }
        ]
      }
    ]
  },
  {
    "id": "R4",
    "name": "Round 4",
    "categories": [
      {
        "name": "90s Cartoon",
        "clues": [
          {
            "value": 100,
            "q": "Guess the cartoon!",
            a: "Pokemon!",
            audioUrl: "assets/audio/pokemon.mp3"
          },
          {
            "value": 200,
            "q": "Guess the cartoon! Clue: chemical X",
            "a": "Powerpuff girls!",
            "audioUrl": "assets/audio/powerpuff-girls-intro.mp3"
          }
        ]
      },
      {
        "name": "Whose Baby Is This?",
        "clues": [
          {
            "value": 100,
            "q": "They are born with their spines under a layer of skin to protect the mom, and they pop out within hours!",
            "a": "Hoglet! Baby hedgehog!",
            "imageUrl": "assets/images/baby_hedgehog.jpg",
            "trickyImage": true,
            "trickyZoom": true
          },
          {
            "value": 200,
            "q": "What is this baby called?",
            "a": "Joey! Baby Wombat!",
            "imageUrl": "assets/images/baby-wombat.png",
            "trickyImage": true,
            "trickyZoom": true
          }
        ]
      },
      {
        "name": "Old Wives' Tale: Boy or Girl?",
        "clues": [
          {
            "value": 100,
            "q": "If you hang a wedding ring on a string over the belly and it swings in a circle, what is it supposed to be?",
            "a": "A Girl (A back-and-forth swing is supposedly a Boy)."
          },
          {
            "value": 200,
            "q": "If the mom-to-be is constantly craving sweets, fruit, and orange juice, the legend says it's a...",
            "a": "A Girl (Salty/savory cravings are for Boys)."
          }
        ]
      },
      {
        "name": "What were they thinking?",
        "clues": [
          {
            "value": 100,
            "q": "In the 1930s, London apartment dwellers were encouraged to put their infants in these metal \"airing\" contraptions that hung out the window. What were they called?",
            "a": "Baby Cages",
            "imageUrl": "assets/images/baby_cages.jpg"
          },
          {
            "value": 200,
            "q": "This 1950s advertisement claimed this beverage was \"so pure\" that it was the perfect mixer for milk to help babies get their vitamins. What is the drink?",
            "a": "7-Up!",
            "imageUrl": "assets/images/baby_7up.png"
          }
        ]
      }
    ]
  },
  {
    "id": "FINAL",
    "name": "Final Round (Winners)",
    "categories": [
      {
        "name": "Mom or Dad?",
        "clues": [
          {
            "value": 100,
            "q": "Mom or Dad?",
            "a": "Mom!",
            "imageUrl": "assets/images/mom.jpg",
          },
          {
            "value": 200,
            "q": "Mom or Dad?",
            "a": "Dad!",
            "imageUrl": "assets/images/dad.jpg",
          }
        ]
      },
      {
        "name": "Price is Right",
        "clues": [
          {
            "value": 100,
            "q": "Forget the plastic diaper clutch! This Italian-made masterpiece features the iconic 'GG' Supreme canvas so your baby can have a diaper change on a literal runway. Within $100, what is the retail price?",
            "imageUrl": "assets/images/gucci_diaper_bag.jpg",
            "a": "$1690"
          },
          {
            "value": 200,
            "q": "For the parent who truly has everything, the brand Suommo created a pacifier made of 18-karat white gold and encrusted with high-quality diamonds. Within $5,000, how much does this 'dummy' cost?",
            "imageUrl": "assets/images/suommo_pacifier.jpeg",
            "a": "$40,000"
          }
        ]
      },
      {
        "name": "The 90s Core-Memory",
        "clues": [
          {
            "value": 100,
            "q": "This next character is the original 'superfood' influencer. He’s been around since the 1920s",
            "a": "Popeye, The Sailor!",
            "audioUrl": "assets/audio/popeye.mp3"
          },
          {
            "value": 200,
            "q": "This duo never speaks, but their slapstick violence defined our childhoods",
            "a": "Tom & Jerry",
            "audioUrl": "assets/audio/tom-and-jerry.mp3"
          }
        ]
      },
      {
        "name": "The Deep Cuts",
        "clues": [
          {
            "value": 100,
            "q": "Whose house is being defended in this 1990 classic?",
            "a": "Home Alone",
            "imageUrl": "assets/images/kevin_home_alone.jpg",
          },
          {
            "value": 200,
            "q": "This specific location is the only hope a frantic father has of finding his son. What movie?",
            "a": "Finding Nemo",
            "imageUrl": "assets/images/nemo.jpg",
          }
        ]
      }
    ]
  }
];
