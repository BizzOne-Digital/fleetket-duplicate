/**
 * Service catalogue copied from the live fleeket.com (api.fleeket.com/services/get_all_services, Oct 2026):
 * names, descriptions, images and the original IDs, with obvious spelling fixed. Seeded once, then owned by the admin.
 */
import type { CategorySeed } from './defaults'

export const LIVE_CATEGORIES: CategorySeed[] = [
  {
    "name": "Automotive",
    "slug": "automotive",
    "legacyId": 32,
    "group": "Auto & Transport",
    "icon": "wrench",
    "description": "The automotive services category encompasses a wide array of offerings including vehicle maintenance, repairs, detailing, and customization.these services cater to the needs of vehicle owners to ensure their automobiles remain safe, reliable, and visually appealing.",
    "image": "https://api.fleeket.com/image/Automotive.jpg",
    "imageAlt": "Automotive",
    "subServices": [
      {
        "name": "Car Detailing",
        "slug": "car-detailing",
        "description": "Car Detailing Service.",
        "image": "https://api.fleeket.com/image/Automotive_CarDetailing.jpg",
        "legacyId": 41
      },
      {
        "name": "Changing Tires",
        "slug": "changing-tires",
        "description": "Seasonal tire changing service involves the removal and replacement of tires on vehicles to accommodate changing weather conditions.",
        "image": "https://api.fleeket.com/image/Automotive_ChangingTires.jpg",
        "legacyId": 38
      },
      {
        "name": "Licensed Automotive Repair",
        "slug": "licensed-automotive-repair",
        "description": "Licensed automotive service refers to professional repair and maintenance solutions provided by certified technicians, ensuring expertise, quality, and compliance with industry standards and regulations.",
        "image": "https://api.fleeket.com/image/Automotive_LicensedAutomativeRepair.jpg",
        "legacyId": 39
      },
      {
        "name": "Scrap Yard",
        "slug": "scrap-yard",
        "description": "Scrap yard used parts service offers salvaged automotive components sourced from scrapped vehicles, providing cost-effective solutions for repairs and replacements.",
        "image": "https://api.fleeket.com/image/Automotive_ScrapYard.jpg",
        "legacyId": 40
      }
    ]
  },
  {
    "name": "Car Pooling",
    "slug": "car-pooling",
    "legacyId": 33,
    "group": "Auto & Transport",
    "icon": "car",
    "description": "Car pooling service facilitates the sharing of private vehicle rides among multiple individuals traveling along similar routes, aiming to reduce traffic congestion, fuel consumption, and environmental impact while promoting cost savings and social interaction.",
    "image": "https://api.fleeket.com/image/CarPooling.jpg",
    "imageAlt": "Car Pooling",
    "subServices": [
      {
        "name": "Car Pooling",
        "slug": "car-pooling",
        "description": "Car pooling service facilitates the sharing of private vehicle rides among multiple individuals traveling along similar routes, aiming to reduce traffic congestion, fuel consumption, and environmental impact while promoting cost savings and social interaction.",
        "image": "https://api.fleeket.com/image/CarPooling.jpg",
        "legacyId": 42
      }
    ]
  },
  {
    "name": "Child Care",
    "slug": "child-care",
    "legacyId": 34,
    "group": "Family & Learning",
    "icon": "baby",
    "description": "Child care services provide professional supervision, education, and nurturing for children during parents' or guardians' absence, ensuring their safety, well-being, and developmental growth in a conducive environment.",
    "image": "https://api.fleeket.com/image/ChildCare.jpg",
    "imageAlt": "Child Care",
    "subServices": [
      {
        "name": "Baby Sitter",
        "slug": "baby-sitter",
        "description": "Babysitter service offers temporary care and supervision for children in their own homes, providing parents with peace of mind and flexibility for their schedules.",
        "image": "https://api.fleeket.com/image/ChildCare_BabySitter.jpg",
        "legacyId": 45
      },
      {
        "name": "Home Based Child Care",
        "slug": "home-based-child-care",
        "description": "Home-based child care service provides a nurturing and educational environment for children within the caregiver's residence, offering personalized attention and a family-like setting conducive to their development and well-being.",
        "image": "https://api.fleeket.com/image/ChildCare_HomeBasedChildcare.jpg",
        "legacyId": 46
      }
    ]
  },
  {
    "name": "Driving Instructor",
    "slug": "driving-instructor",
    "legacyId": 21,
    "group": "Auto & Transport",
    "icon": "car-front",
    "description": "Driving instructors service offers professional guidance and instruction to individuals seeking to learn or improve their driving skills, emphasizing safety, confidence, and adherence to traffic laws.",
    "image": "https://api.fleeket.com/image/DrivingInstractor.jpg",
    "imageAlt": "Driving Instructor",
    "subServices": [
      {
        "name": "Driving Instructor",
        "slug": "driving-instructor",
        "description": "Driving instructors service offers professional guidance and instruction to individuals seeking to learn or improve their driving skills, emphasizing safety, confidence, and adherence to traffic laws.",
        "image": "https://api.fleeket.com/image/DrivingInstractor.jpg",
        "legacyId": 51
      }
    ]
  },
  {
    "name": "Event Planner",
    "slug": "event-planner",
    "legacyId": 23,
    "group": "Events & Creative",
    "icon": "calendar-days",
    "description": "Event planner service coordinates and executes all aspects of an event, from conception to completion, ensuring a seamless and memorable experience tailored to clients' needs and preferences.",
    "image": "https://api.fleeket.com/image/EventPlanner.jpg",
    "imageAlt": "Event Planner",
    "subServices": [
      {
        "name": "Event Planner",
        "slug": "event-planner",
        "description": "Event planner service coordinates and executes all aspects of an event, from conception to completion, ensuring a seamless and memorable experience tailored to clients' needs and preferences.",
        "image": "https://api.fleeket.com/image/EventPlanner.jpg",
        "legacyId": 52
      }
    ]
  },
  {
    "name": "Health and Wellness",
    "slug": "health-and-wellness",
    "legacyId": 35,
    "group": "Wellness & Lifestyle",
    "icon": "heart-pulse",
    "description": "Health and wellness service provides comprehensive support and resources aimed at promoting physical, mental, and emotional well-being, empowering individuals to achieve optimal health and vitality.",
    "image": "https://api.fleeket.com/image/HealthAndWellness.jpg",
    "imageAlt": "Health and Wellness",
    "subServices": [
      {
        "name": "Hair Dresser",
        "slug": "hair-dresser",
        "description": "Hairdresser service provides expert hair styling, cutting, coloring, and treatment options tailored to clients' preferences and needs, aiming to achieve desired looks and enhance overall appearance.",
        "image": "https://api.fleeket.com/image/HealthAndWellness_HairDresser.jpg",
        "legacyId": 48
      },
      {
        "name": "Manicure and Pedicure",
        "slug": "manicure-and-pedicure",
        "description": "Manicure and pedicure service offers professional nail care treatments, including shaping, polishing, and grooming, to enhance the appearance and health of hands and feet.",
        "image": "https://api.fleeket.com/image/HealthAndWellness_ManicureAndPedicure.jpg",
        "legacyId": 47
      },
      {
        "name": "Nutrition & Diet",
        "slug": "nutrition-and-diet",
        "description": "Nutrition and diet service provides tailored dietary guidance and meal planning strategies to promote optimal health, weight management, and overall well-being based on individual needs and goals.",
        "image": "https://api.fleeket.com/image/HealthAndWellness_NutritionDiet.jpg",
        "legacyId": 50
      },
      {
        "name": "Personal Trainer",
        "slug": "personal-trainer",
        "description": "Personal trainer service offers customized fitness programs and one-on-one coaching sessions to help clients achieve their health and fitness goals through personalized guidance, motivation, and accountability.",
        "image": "https://api.fleeket.com/image/HealthAndWellness_PersonalTrainer.jpg",
        "legacyId": 49
      }
    ]
  },
  {
    "name": "House Keeping",
    "slug": "house-keeping",
    "legacyId": 25,
    "group": "Home & Property",
    "icon": "spray-can",
    "description": "Housekeeping service offers professional cleaning and maintenance solutions for residential and commercial spaces, ensuring cleanliness, organization, and comfort for homeowners or occupants.",
    "image": "https://api.fleeket.com/image/HouseKeeping.jpg",
    "imageAlt": "House Keeping",
    "subServices": [
      {
        "name": "Closet organizing",
        "slug": "closet-organizing",
        "description": "Closet organizing service offers expert decluttering, sorting, and storage solutions to maximize space and efficiency within closets, enhancing accessibility and organization of clothing and belongings.",
        "image": "https://api.fleeket.com/image/HouseKepping_ClosetOrganizing.jpg",
        "legacyId": 54
      },
      {
        "name": "House Cleaning",
        "slug": "house-cleaning",
        "description": "House cleaning service provides thorough and efficient cleaning of residential spaces, including dusting, vacuuming, mopping, and sanitizing, to maintain a tidy and hygienic environment for occupants.",
        "image": "https://api.fleeket.com/image/HouseKepping_HouseCleaning.jpg",
        "legacyId": 53
      }
    ]
  },
  {
    "name": "Image Consultant",
    "slug": "image-consultant",
    "legacyId": 26,
    "group": "Wellness & Lifestyle",
    "icon": "shirt",
    "description": "Image consultant service provides personalized advice and guidance on personal grooming, fashion styling, and presentation skills to enhance clients' overall appearance and confidence.",
    "image": "https://api.fleeket.com/image/ImageConsultant.jpg",
    "imageAlt": "Image Consultant",
    "subServices": [
      {
        "name": "Image Consultant",
        "slug": "image-consultant",
        "description": "Image consultant service provides personalized advice and guidance on personal grooming, fashion styling, and presentation skills to enhance clients' overall appearance and confidence.",
        "image": "https://api.fleeket.com/image/ImageConsultant.jpg",
        "legacyId": 55
      }
    ]
  },
  {
    "name": "Life Coach",
    "slug": "life-coach",
    "legacyId": 27,
    "group": "Wellness & Lifestyle",
    "icon": "compass",
    "description": "Life coach service offers personalized guidance and support to individuals seeking to clarify goals, overcome obstacles, and maximize their potential in various aspects of life, including career, relationships, and personal development.",
    "image": "https://api.fleeket.com/image/LifeCoach.jpg",
    "imageAlt": "Life Coach",
    "subServices": [
      {
        "name": "Life Coach",
        "slug": "life-coach",
        "description": "Life coach service offers personalized guidance and support to individuals seeking to clarify goals, overcome obstacles, and maximize their potential in various aspects of life, including career, relationships, and personal development.",
        "image": "https://api.fleeket.com/image/LifeCoach.jpg",
        "legacyId": 56
      }
    ]
  },
  {
    "name": "Local Farmers",
    "slug": "local-farmers",
    "legacyId": 28,
    "group": "Business & Local",
    "icon": "sprout",
    "description": "Local farmers' service connects consumers with fresh, locally sourced agricultural products while supporting small-scale farmers and promoting sustainable farming practices within the community.",
    "image": "https://api.fleeket.com/image/LocalFarmers.jpg",
    "imageAlt": "Local Farmers",
    "subServices": [
      {
        "name": "Local Farmers",
        "slug": "local-farmers",
        "description": "Local farmers' service connects consumers with fresh, locally sourced agricultural products while supporting small-scale farmers and promoting sustainable farming practices within the community.",
        "image": "https://api.fleeket.com/image/LocalFarmers.jpg",
        "legacyId": 57
      }
    ]
  },
  {
    "name": "Moving Services",
    "slug": "moving-services",
    "legacyId": 29,
    "group": "Home & Property",
    "icon": "truck",
    "description": "Moving service provides professional assistance with relocating belongings from one location to another, offering efficient packing, transportation, and unpacking solutions to streamline the moving process for individuals or businesses.",
    "image": "https://api.fleeket.com/image/MovingServices.jpg",
    "imageAlt": "Moving Services",
    "subServices": [
      {
        "name": "Moving Services",
        "slug": "moving-services",
        "description": "Moving service provides professional assistance with relocating belongings from one location to another, offering efficient packing, transportation, and unpacking solutions to streamline the moving process for individuals or businesses.",
        "image": "https://api.fleeket.com/image/MovingServices.jpg",
        "legacyId": 58
      }
    ]
  },
  {
    "name": "Pest Control",
    "slug": "pest-control",
    "legacyId": 39,
    "group": "Home & Property",
    "icon": "bug",
    "description": "Pest control services involve the management and eradication of unwanted pests, such as insects, rodents, and other nuisance creatures, to maintain a healthy and hygienic environment.",
    "image": "https://api.fleeket.com/image/PestControl.jpg",
    "imageAlt": "Pest Control",
    "subServices": [
      {
        "name": "Pest Control",
        "slug": "pest-control",
        "description": "Pest control services involve the management and eradication of unwanted pests, such as insects, rodents, and other nuisance creatures, to maintain a healthy and hygienic environment.",
        "image": "https://api.fleeket.com/image/PestControl.jpg",
        "legacyId": 62
      }
    ]
  },
  {
    "name": "Pet Services",
    "slug": "pet-services",
    "legacyId": 30,
    "group": "Family & Learning",
    "icon": "paw-print",
    "description": "Pet services encompass a range of offerings including pet grooming, boarding, walking, and veterinary care, catering to the various needs and well-being of companion animals.",
    "image": "https://api.fleeket.com/image/PetServices.jpg",
    "imageAlt": "Pet Services",
    "subServices": [
      {
        "name": "Dog Walker",
        "slug": "dog-walker",
        "description": "Dog walking service involves professionally-led outings for dogs, ensuring they receive exercise, mental stimulation, and socialization while their owners are away.",
        "image": "https://api.fleeket.com/image/PetServices_DogWalker.jpg",
        "legacyId": 59
      },
      {
        "name": "Pet Groomer",
        "slug": "pet-groomer",
        "description": "A pet groomer provides professional care and grooming services for animals, including bathing, brushing, nail trimming, and styling, to maintain their hygiene and appearance.",
        "image": "https://api.fleeket.com/image/PetServices_PetGroomer.jpg",
        "legacyId": 60
      },
      {
        "name": "Veterinary",
        "slug": "veterinary",
        "description": "Veterinary service offers medical care, diagnostic assessments, and preventative treatments for animals, ensuring their health, well-being, and longevity under the expertise of trained veterinarians.",
        "image": "https://api.fleeket.com/image/PetServices_Veternary.jpg",
        "legacyId": 61
      }
    ]
  },
  {
    "name": "Photographer",
    "slug": "photographer",
    "legacyId": 40,
    "group": "Events & Creative",
    "icon": "camera",
    "description": "Photography service offers expertly captured moments that celebrate the beginnings of life, the journey of love, and the beauty of diverse environments, preserving cherished memories for generations to come.",
    "image": "https://api.fleeket.com/image/Photographer.jpg",
    "imageAlt": "Photographer",
    "subServices": [
      {
        "name": "Photographer",
        "slug": "photographer",
        "description": "Photography service offers expertly captured moments that celebrate the beginnings of life, the journey of love, and the beauty of diverse environments, preserving cherished memories for generations to come.",
        "image": "https://api.fleeket.com/image/Photographer_Photographer.jpg",
        "legacyId": 63
      },
      {
        "name": "Videographer",
        "slug": "videographer",
        "description": "...",
        "image": "https://api.fleeket.com/image/Photographer_Videographer.jpg",
        "legacyId": 64
      }
    ]
  },
  {
    "name": "Renovation",
    "slug": "renovation",
    "legacyId": 42,
    "group": "Home & Property",
    "icon": "hammer",
    "description": "Renovation service transforms spaces by providing expert remodeling, refurbishment, and enhancement solutions tailored to clients' needs and preferences.",
    "image": "https://api.fleeket.com/image/Renovation.jpg",
    "imageAlt": "Renovation",
    "subServices": [
      {
        "name": "Concrete Work",
        "slug": "concrete-work",
        "description": "Concrete work service encompasses various tasks such as pouring, shaping, finishing, and repairing concrete surfaces to create durable and functional structures for both residential and commercial projects.",
        "image": "https://api.fleeket.com/image/Renovation_ConcreteWork.jpg",
        "legacyId": 69
      },
      {
        "name": "Fixing Drywall",
        "slug": "fixing-drywall",
        "description": "Fixing drywall service repairs damaged or deteriorated drywall surfaces, restoring them to their original condition with precision and efficiency.",
        "image": "https://api.fleeket.com/image/Renovation_FixingDryWall.jpg",
        "legacyId": 66
      },
      {
        "name": "Interior Designers",
        "slug": "interior-designers",
        "description": "Interior design service encompasses the art and science of enhancing the interior of a space to create aesthetically pleasing and functional environments that reflect the client's vision and lifestyle.",
        "image": "https://api.fleeket.com/image/Renovation_InteriorDesigners.jpg",
        "legacyId": 71
      },
      {
        "name": "Painting",
        "slug": "painting",
        "description": "painting service involves expertly applying paint to surfaces, enhancing aesthetics and protecting the integrity of buildings and structures.",
        "image": "https://api.fleeket.com/image/Renovation_Painting.jpg",
        "legacyId": 70
      },
      {
        "name": "Popcorn Ceiling Removal",
        "slug": "popcorn-ceiling-removal",
        "description": "Popcorn ceiling removal involves the process of eliminating textured ceiling surfaces to achieve a smoother, updated look in a space.",
        "image": "https://api.fleeket.com/image/Renovation_PopcornCeilingRemova.jpg",
        "legacyId": 67
      },
      {
        "name": "Wet Basement Repair",
        "slug": "wet-basement-repair",
        "description": "Wet basement repair service addresses water intrusion issues in basements, ensuring structural integrity, preventing mold growth, and maintaining a dry and usable space.",
        "image": "https://api.fleeket.com/image/Renovation_WetBasmentRepair.jpg",
        "legacyId": 68
      }
    ]
  },
  {
    "name": "Seasonal",
    "slug": "seasonal",
    "legacyId": 43,
    "group": "Home & Property",
    "icon": "snowflake",
    "description": "Seasonal service offers scheduled maintenance and adjustments tailored to specific times of the year, ensuring optimal performance and longevity of equipment or property throughout changing environmental conditions.",
    "image": "https://api.fleeket.com/image/Seasonal.jpg",
    "imageAlt": "Seasonal",
    "subServices": [
      {
        "name": "Backyard Landscaping / Planting",
        "slug": "backyard-landscaping-planting",
        "description": "Backyard landscaping/planting service offers comprehensive solutions tailored to enhance outdoor spaces through expert design, implementation, and maintenance of greenery, hardscaping, and amenities.",
        "image": "https://api.fleeket.com/image/Seasonal_BackyardLandscaping-Planting.jpg",
        "legacyId": 76
      },
      {
        "name": "Bicycle Repair",
        "slug": "bicycle-repair",
        "description": "Bicycle repair service offers comprehensive maintenance and repairs to ensure optimal performance and longevity of bicycles, catering to cyclists' needs and safety concerns.",
        "image": "https://api.fleeket.com/image/Seasonal_BicycleRepair.jpg",
        "legacyId": 77
      },
      {
        "name": "Christmas lights, Halloween & Festive",
        "slug": "christmas-lights-halloween-and-festive",
        "description": "Our festive needs service offers comprehensive solutions for Christmas lights, Halloween decorations, and other seasonal adornments to elevate holiday celebrations with ease and convenience.",
        "image": "https://api.fleeket.com/image/Seasonal_ChristmasLights-Halloween.jpg",
        "legacyId": 75
      },
      {
        "name": "Grass Cutting",
        "slug": "grass-cutting",
        "description": "A grass cutting service offers professional lawn maintenance, ensuring neat and well-manicured outdoor spaces through regular mowing and trimming.",
        "image": "https://api.fleeket.com/image/Seasonal_GrassCutting.jpg",
        "legacyId": 72
      },
      {
        "name": "Gutter Cleaning",
        "slug": "gutter-cleaning",
        "description": "A grass cutting service offers professional lawn maintenance, ensuring neat and well-manicured outdoor spaces through regular mowing and trimming.",
        "image": "https://api.fleeket.com/image/Seasonal_GutterCleaning.jpg",
        "legacyId": 74
      },
      {
        "name": "Snow Removal",
        "slug": "snow-removal",
        "description": "Snow removal service efficiently clears snow and ice from residential or commercial properties, ensuring safe and accessible environments during winter weather conditions.",
        "image": "https://api.fleeket.com/image/Seasonal_SnowRemoval.jpg",
        "legacyId": 73
      }
    ]
  },
  {
    "name": "Tailoring",
    "slug": "tailoring",
    "legacyId": 44,
    "group": "Wellness & Lifestyle",
    "icon": "scissors",
    "description": "Tailoring service provides personalized alterations and adjustments to garments, ensuring a perfect fit and enhancing the overall appearance of clothing.",
    "image": "https://api.fleeket.com/image/Tailoring.jpg",
    "imageAlt": "Tailoring",
    "subServices": [
      {
        "name": "Tailoring",
        "slug": "tailoring",
        "description": "Tailoring service provides personalized alterations and adjustments to garments, ensuring a perfect fit and enhancing the overall appearance of clothing.",
        "image": "https://api.fleeket.com/image/Tailoring.jpg",
        "legacyId": 78
      }
    ]
  },
  {
    "name": "Taxes",
    "slug": "taxes",
    "legacyId": 45,
    "group": "Business & Local",
    "icon": "calculator",
    "description": "Tax services encompass a range of professional assistance and expertise aimed at accurately calculating, filing, and optimizing taxes to ensure compliance with legal requirements and maximize financial efficiency for individuals and businesses.",
    "image": "https://api.fleeket.com/image/Taxes.jpg",
    "imageAlt": "Taxes",
    "subServices": [
      {
        "name": "Licensed Tax Accountant",
        "slug": "licensed-tax-accountant",
        "description": "Tax services encompass a range of professional assistance and expertise aimed at accurately calculating, filing, and optimizing taxes to ensure compliance with legal requirements and maximize financial efficiency for individuals and businesses.",
        "image": "https://api.fleeket.com/image/Taxes.jpg",
        "legacyId": 79
      }
    ]
  },
  {
    "name": "Technician",
    "slug": "technician",
    "legacyId": 46,
    "group": "Home & Property",
    "icon": "monitor-smartphone",
    "description": "Technicians service provides skilled professionals who offer expertise and assistance in diagnosing, repairing, and maintaining various technical systems or equipment to ensure functionality and efficiency.",
    "image": "https://api.fleeket.com/image/Techician.jpg",
    "imageAlt": "Technician",
    "subServices": [
      {
        "name": "Gas Technician",
        "slug": "gas-technician",
        "description": "Gas technician service involves the skilled inspection, installation, maintenance, and repair of gas-related appliances and systems, ensuring safety and efficiency in residential and commercial settings.",
        "image": "https://api.fleeket.com/image/Techician_GasTechnician.jpg",
        "legacyId": 80
      },
      {
        "name": "HVAC",
        "slug": "hvac",
        "description": "HVAC system service provides thorough maintenance, repair, and installation of heating, ventilation, and air conditioning systems to ensure optimal performance, energy efficiency, and indoor comfort.",
        "image": "https://api.fleeket.com/image/Techician_HVAC.jpg",
        "legacyId": 82
      },
      {
        "name": "Plumbing",
        "slug": "plumbing",
        "description": "Plumbing service encompasses the installation, repair, and maintenance of water, gas, and sewage systems, ensuring functionality and efficiency within residential, commercial, and industrial settings.",
        "image": "https://api.fleeket.com/image/Techician_Plumbing.jpg",
        "legacyId": 81
      }
    ]
  },
  {
    "name": "Towing",
    "slug": "towing",
    "legacyId": 48,
    "group": "Auto & Transport",
    "icon": "life-buoy",
    "description": "Towing service provides roadside assistance by safely transporting vehicles to designated locations, offering timely solutions for breakdowns, accidents, or vehicle relocations.",
    "image": "https://api.fleeket.com/image/Towing.jpg",
    "imageAlt": "Towing",
    "subServices": [
      {
        "name": "Tow Truck",
        "slug": "tow-truck",
        "description": "Towing service provides roadside assistance by safely transporting vehicles to designated locations, offering timely solutions for breakdowns, accidents, or vehicle relocations.",
        "image": "https://api.fleeket.com/image/Towing.jpg",
        "legacyId": 83
      }
    ]
  },
  {
    "name": "Tutoring",
    "slug": "tutoring",
    "legacyId": 49,
    "group": "Family & Learning",
    "icon": "graduation-cap",
    "description": "Tutoring service provides personalized educational support and guidance to students, aiming to enhance their understanding, skills, and confidence in various subjects or academic areas.",
    "image": "https://api.fleeket.com/image/Tutoring.jpg",
    "imageAlt": "Tutoring",
    "subServices": [
      {
        "name": "Academic",
        "slug": "academic",
        "description": "Academic tutoring service provides personalized educational support and guidance to students, aiming to enhance their understanding, skills, and confidence in various academic subjects and areas of study.",
        "image": "https://api.fleeket.com/image/Tutoring_Academic.jpg",
        "legacyId": 84
      },
      {
        "name": "Musical",
        "slug": "musical",
        "description": "Musical tutoring service provides personalized instruction in music theory, instruments, and performance, helping students develop their musical skills, technique, and confidence.",
        "image": "https://api.fleeket.com/image/Tutoring_Musical.jpg",
        "legacyId": 88
      }
    ]
  },
  {
    "name": "Wood Craft",
    "slug": "wood-craft",
    "legacyId": 50,
    "group": "Home & Property",
    "icon": "ruler",
    "description": "Wood craft service involves the meticulous crafting and shaping of wood into various customized designs and functional pieces, showcasing the natural beauty and versatility of the material.",
    "image": "https://api.fleeket.com/image/WoodCraft.jpg",
    "imageAlt": "Wood Craft",
    "subServices": [
      {
        "name": "Wood Turning",
        "slug": "wood-turning",
        "description": "Wood turning service involves the skilled craftsmanship of shaping wood using a lathe to create intricately designed objects such as bowls, spindles, and decorative pieces.",
        "image": "https://api.fleeket.com/image/WoodCraft_WoodTurning.jpg",
        "legacyId": 85
      },
      {
        "name": "Wood working",
        "slug": "wood-working",
        "description": "Wood working service encompasses the skilled craftsmanship of shaping, carving, and constructing wooden objects or structures tailored to clients' specifications and design preferences.",
        "image": "https://api.fleeket.com/image/WoodCraft_WoodWorking.jpg",
        "legacyId": 86
      }
    ]
  }
]
