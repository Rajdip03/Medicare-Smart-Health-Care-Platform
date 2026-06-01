import appointment_img from './appointment_img.png'
import header_img from './header_img.png'
import group_profiles from './group_profiles.png'
import profile_pic from './profile_pic.png'
import contact_image from './contact_image.png'
import about_image from './about_image.png'
import logo from './logo.png'
import dropdown_icon from './dropdown_icon.svg'
import menu_icon from './menu_icon.svg'
import cross_icon from './cross_icon.png'
import chats_icon from './chats_icon.svg'
import verified_icon from './verified_icon.svg'
import arrow_icon from './arrow_icon.svg'
import info_icon from './info_icon.svg'
import upload_icon from './upload_icon.png'
import stripe_logo from './stripe_logo.png'
import razorpay_logo from './razorpay_logo.png'
import doc1 from './doc1.png'
import doc2 from './doc2.png'
import doc3 from './doc3.png'
import doc4 from './doc4.png'
import doc5 from './doc5.png'
import doc6 from './doc6.png'
import doc7 from './doc7.png'
import doc8 from './doc8.png'
import doc9 from './doc9.png'
import doc10 from './doc10.png'
import doc11 from './doc11.png'
import doc12 from './doc12.png'
import doc13 from './doc13.png'
import doc14 from './doc14.png'
import doc15 from './doc15.png'
import Dermatologist from './Dermatologist.svg'
import Gastroenterologist from './Gastroenterologist.svg'
import General_physician from './General_physician.svg'
import Gynecologist from './Gynecologist.svg'
import Neurologist from './Neurologist.svg'
import Pediatricians from './Pediatricians.svg'


export const assets = {
    appointment_img,
    header_img,
    group_profiles,
    logo,
    chats_icon,
    verified_icon,
    info_icon,
    profile_pic,
    arrow_icon,
    contact_image,
    about_image,
    menu_icon,
    cross_icon,
    dropdown_icon,
    upload_icon,
    stripe_logo,
    razorpay_logo
}

export const specialityData = [
    {
        speciality: 'General physician',
        image: General_physician
    },
    {
        speciality: 'Gynecologist',
        image: Gynecologist
    },
    {
        speciality: 'Dermatologist',
        image: Dermatologist
    },
    {
        speciality: 'Pediatricians',
        image: Pediatricians
    },
    {
        speciality: 'Neurologist',
        image: Neurologist
    },
    {
        speciality: 'Gastroenterologist',
        image: Gastroenterologist
    },
]

export const doctors = [
    {
        _id: 'doc1',
        name: 'Dr. Rajesh Sharma',
        image: doc1,
        speciality: 'General physician',
        degree: 'MBBS, MD',
        experience: '10 Years',
        about: 'Dr. Rajesh Sharma is known for accurate diagnosis and preventive care in general medicine. He emphasizes patient education and believes in a holistic approach to wellness. His consultations often include lifestyle and nutritional guidance.',
        fees: 500,
        address: {
            line1: 'Sector 12, Dwarka',
            line2: 'New Delhi, India'
        }
    },
    {
        _id: 'doc2',
        name: 'Dr. Neha Verma',
        image: doc2,
        speciality: 'Gynecologist',
        degree: 'MBBS, MS (Obstetrics & Gynaecology)',
        experience: '7 Years',
        about: 'Dr. Neha Verma is experienced in prenatal care, high-risk pregnancies, and fertility treatments. She provides compassionate care for women’s health across all life stages, from adolescence to menopause. Her practice includes both surgical and non-surgical procedures.',
        fees: 600,
        address: {
            line1: 'Baner Road',
            line2: 'Pune, Maharashtra'
        }
    },
    {
        _id: 'doc3',
        name: 'Dr. Anjali Mehta',
        image: doc3,
        speciality: 'Dermatologist',
        degree: 'MBBS, MD (Dermatology)',
        experience: '5 Years',
        about: 'Specialist in acne, pigmentation, and non-invasive skin treatments. Dr. Mehta blends cosmetic and medical dermatology to provide personalized skincare solutions. She frequently speaks at skin health awareness programs and seminars.',
        fees: 900,
        address: {
            line1: 'Salt Lake Sector V',
            line2: 'Kolkata, West Bengal'
        }
    },
    {
        _id: 'doc4',
        name: 'Dr. Ramesh Iyer',
        image: doc4,
        speciality: 'Pediatricians',
        degree: 'MBBS, DCH',
        experience: '8 Years',
        about: 'Friendly and experienced pediatrician focused on immunizations and child development. Dr. Iyer provides evidence-based pediatric care, emphasizing early childhood growth milestones, nutrition, and behavioral development.',
        fees: 850,
        address: {
            line1: 'Anna Nagar',
            line2: 'Chennai, Tamil Nadu'
        }
    },
    {
        _id: 'doc5',
        name: 'Dr. Kavita Desai',
        image: doc5,
        speciality: 'Neurologist',
        degree: 'MBBS, DM (Neurology)',
        experience: '9 Years',
        about: 'Expert in treating epilepsy, stroke, and neurodegenerative disorders. Dr. Desai uses a patient-centric approach to neurological disorders and actively participates in clinical research. She has published papers on brain health and neuroimaging.',
        fees: 950,
        address: {
            line1: 'MG Road',
            line2: 'Bengaluru, Karnataka'
        }
    },
    {
        _id: 'doc6',
        name: 'Dr. Arvind Patel',
        image: doc6,
        speciality: 'General physician',
        degree: 'MBBS, MD',
        experience: '11 Years',
        about: 'Specialist in fractures, joint pain, and arthroscopic surgery. Dr. Patel has treated thousands of patients with musculoskeletal injuries. He advocates early rehabilitation and minimally invasive surgeries to reduce recovery time.',
        fees: 800,
        address: {
            line1: 'Ellis Bridge',
            line2: 'Ahmedabad, Gujarat'
        }
    },
    {
        _id: 'doc7',
        name: 'Dr. Priya Nair',
        image: doc7,
        speciality: 'Gynecologist',
        degree: 'MBBS, MD (Gynecologist)',
        experience: '6 Years',
        about: 'Helps patients manage anxiety, depression, and stress disorders. Dr. Nair creates a safe space for her patients and incorporates modern therapies like CBT, mindfulness, and medication management in her practice.',
        fees: 800,
        address: {
            line1: 'Marine Drive',
            line2: 'Mumbai, Maharashtra'
        }
    },
    {
        _id: 'doc8',
        name: 'Dr. Suresh Reddy',
        image: doc8,
        speciality: 'Dermatologist',
        degree: 'MBBS, DM (Dermatologist)',
        experience: '12 Years',
        about: 'Renowned for angioplasty and advanced cardiac care. Dr. Reddy also provides preventive cardiology services to manage hypertension, cholesterol, and lifestyle-related heart diseases. His approach is patient-centric with a strong focus on early detection.',
        fees: 900,
        address: {
            line1: 'Banjara Hills',
            line2: 'Hyderabad, Telangana'
        }
    },
    {
        _id: 'doc9',
        name: 'Dr. Sneha Joshi',
        image: doc9,
        speciality: 'Pediatricians',
        degree: 'MBBS, MS (Pediatricians)',
        experience: '6 Years',
        about: 'Specialist in sinus, throat infections, and hearing problems. Dr. Joshi uses advanced diagnostic tools and endoscopic techniques to treat ENT disorders. She is known for her gentle approach with children and elderly patients.',
        fees: 700,
        address: {
            line1: 'Fergusson College Road',
            line2: 'Pune, Maharashtra'
        }
    },
    {
        _id: 'doc10',
        name: 'Dr. Manoj Kumar',
        image: doc10,
        speciality: 'Neurologist',
        degree: 'MBBS, DM (Neurologist)',
        experience: '10 Years',
        about: 'Cancer specialist with focus on chemotherapy and targeted therapy. Dr. Kumar has led several cancer awareness drives and offers personalized treatment plans using the latest oncological advancements. He supports both curative and palliative care.',
        fees: 1000,
        address: {
            line1: 'AIIMS Campus',
            line2: 'New Delhi, India'
        }
    },
    {
        _id: 'doc11',
        name: 'Dr. Aisha Khan',
        image: doc11,
        speciality: 'Gastroenterologist',
        degree: 'MBBS, MS (Gastroenterologist)',
        experience: '8 Years',
        about: 'Eye care specialist including LASIK and cataract surgery. Dr. Khan performs a wide range of vision correction procedures and promotes regular eye checkups. She has a special interest in diabetic retinopathy and glaucoma.',
        fees: 1000,
        address: {
            line1: 'Ballygunge',
            line2: 'Kolkata, West Bengal'
        }
    },
    {
        _id: 'doc12',
        name: 'Dr. Harshad Roy',
        image: doc12,
        speciality: 'Gastroenterologist',
        degree: 'MBBS, MS, MCh (Gastroenterologist)',
        experience: '9 Years',
        about: 'Experienced in treating kidney stones and urinary disorders. Dr. Dixit is proficient in laser and laparoscopic surgeries. He also addresses prostate and bladder health issues, offering male reproductive health consultations.',
        fees: 1200,
        address: {
            line1: 'Navrangpura',
            line2: 'Ahmedabad, Gujarat'
        }
    },
    {
        _id: 'doc13',
        name: 'Dr. Meenakshi Rao',
        image: doc13,
        speciality: 'General physician',
        degree: 'MBBS, MD',
        experience: '7 Years',
        about: 'Specializes in treating diabetes, thyroid, and hormonal disorders. Dr. Rao provides detailed education to patients and focuses on long-term management and lifestyle adjustments. She also addresses adolescent hormonal imbalances.',
        fees: 850,
        address: {
            line1: 'Thiruvanmiyur',
            line2: 'Chennai, Tamil Nadu'
        }
    },
    {
        _id: 'doc14',
        name: 'Dr. Abhay Joshi',
        image: doc14,
        speciality: 'Gynecologist',
        degree: 'MBBS, MD (Gynecologist)',
        experience: '6 Years',
        about: 'Expert in asthma, COPD, and lung infections. Dr. Joshi is committed to improving respiratory health with cutting-edge treatments. He actively promotes air quality awareness and smoking cessation programs.',
        fees: 950,
        address: {
            line1: 'Andheri East',
            line2: 'Mumbai, Maharashtra'
        }
    },
    {
        _id: 'doc15',
        name: 'Dr. Swati Bhargava',
        image: doc15,
        speciality: 'Neurologist',
        degree: 'BDS, MDS',
        experience: '5 Years',
        about: 'Dental surgeon experienced in root canal, cosmetic dentistry, and orthodontics. Dr. Bhargava uses digital dentistry tools for precision and comfort. She has a keen interest in pediatric dentistry and smile design.',
        fees: 1200,
        address: {
            line1: 'Vaishali Nagar',
            line2: 'Jaipur, Rajasthan'
        }
    }
];
