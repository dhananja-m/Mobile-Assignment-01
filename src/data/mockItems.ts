export interface CampusItem {
  id: string;
  title: string;
  category: 'Found' | 'Lost' | 'Exchange';
  location: string;
  date: string;
  contact: string;
  handover: string;
  description: string;
  image: any;
  isSaved: boolean;
  isClaimed: boolean;
}

// Uses local asset images already included in Expo so they never fail offline
const defaultImg = require('../../assets/images/react-logo.png');

export const INITIAL_ITEMS: CampusItem[] = [
  {
    id: '1',
    title: 'Casio fx-991EX Scientific Calculator',
    category: 'Found',
    location: 'Science Faculty - Auditorium A2',
    date: 'Nov 16, 2026',
    contact: 'Kasun Perera (077-1234567)',
    handover: 'Department of Statistics Office',
    description: 'Found on the 3rd row desk after the STAT 31622 lecture. Has a small blue sticker on the back cover.',
    image: defaultImg,
    isSaved: false,
    isClaimed: false,
  },
  {
    id: '2',
    title: 'University Student ID (SC/2022/XXXX)',
    category: 'Found',
    location: 'Main Library - 2nd Floor',
    date: 'Nov 16, 2026',
    contact: 'Nethmi Silva (071-9876543)',
    handover: 'Library Security Counter',
    description: 'Dropped near the computer terminals. Left it with the front desk security officer.',
    image: defaultImg,
    isSaved: false,
    isClaimed: false,
  },
  {
    id: '3',
    title: 'White Chemistry Lab Coat (Size M)',
    category: 'Lost',
    location: 'Physical Science Canteen',
    date: 'Nov 15, 2026',
    contact: 'Dilshan Jayawardena (076-5554321)',
    handover: 'Contact via WhatsApp',
    description: 'Left folded on a bench near the juice bar around 1:30 PM. Name "Dilshan" written on the inner collar.',
    image: defaultImg,
    isSaved: false,
    isClaimed: false,
  },
  {
    id: '4',
    title: 'Introduction to Linear Algebra (Gilbert Strang)',
    category: 'Exchange',
    location: 'ICT Center Lobby',
    date: 'Nov 15, 2026',
    contact: 'Sahan Bandara (075-2223344)',
    handover: 'Meet at Main Canteen',
    description: '5th Edition textbook in good condition. Looking to exchange for a Probability & Statistics reference book.',
    image: defaultImg,
    isSaved: false,
    isClaimed: false,
  },
  {
    id: '5',
    title: 'Black Baseus 10000mAh Power Bank',
    category: 'Lost',
    location: 'Kandy Road Bus Halt (Campus Gate)',
    date: 'Nov 14, 2026',
    contact: 'Tharindu Fernando (078-8889900)',
    handover: 'Security Post - Main Gate',
    description: 'Lost around 5:15 PM while boarding the 138 bus. Has a short Type-C cable attached.',
    image: defaultImg,
    isSaved: false,
    isClaimed: false,
  },
];