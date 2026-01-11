import { BloodGroup, User, BloodRequest, Translation } from './types';

export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const MAX_LIFETIME_DONATIONS = 50; // Hard limit for health safety

export const DICTIONARY: Translation = {
  welcome: { en: 'Welcome back', te: 'స్వాగతం' },
  emergency_alert: { en: 'Emergency Alert', te: 'అత్యవసర హెచ్చరిక' },
  donate_blood: { en: 'Donate Blood', te: 'రక్తదానం చేయండి' },
  find_donors: { en: 'Find Donors', te: 'దాతలను కనుగొనండి' },
  available: { en: 'Available', te: 'అందుబాటులో ఉంది' },
  busy: { en: 'Busy', te: 'బిజీ' },
  request_blood: { en: 'Request Blood', te: 'రక్తాన్ని అభ్యర్థించండి' },
  critical: { en: 'CRITICAL', te: 'ప్రమాదకరమైన' },
  high: { en: 'HIGH', te: 'అధిక' },
  normal: { en: 'NORMAL', te: 'సాధారణ' },
  dashboard: { en: 'Dashboard', te: 'డ్యాష్‌బోర్డ్' },
  pre_booking: { en: 'Pre-Booking', te: 'ముందస్తు బుకింగ్' },
  trust_score: { en: 'Trust Score', te: 'నమ్మక స్కోర్' },
  lives_saved: { en: 'Lives Saved', te: 'కాపాడిన ప్రాణాలు' },
};

// Mock Users
export const MOCK_USERS: User[] = [
  {
    id: 'd1',
    name: 'Ravi Kumar',
    role: 'DONOR',
    email: 'ravi@example.com',
    bloodGroup: 'O+',
    location: { lat: 17.3850, lng: 78.4867, address: 'Charminar, Hyderabad' },
    isAvailable: true,
    lastDonationDate: '2023-11-15',
    donationCount: 12,
    trustScore: 850,
    badges: ['Life Saver', 'Verified Hero'],
    phone: '+91 9876543210'
  },
  {
    id: 'd2',
    name: 'Amit Sharma',
    role: 'DONOR',
    email: 'amit@example.com',
    bloodGroup: 'AB-',
    location: { lat: 17.3950, lng: 78.4967, address: 'Abids, Hyderabad' },
    isAvailable: true,
    lastDonationDate: '2024-01-20',
    donationCount: 5,
    trustScore: 400,
    badges: ['Regular Donor'],
    phone: '+91 9870000000'
  },
  {
    id: 'h1',
    name: 'Apollo Hospital',
    role: 'HOSPITAL',
    email: 'admin@apollo.com',
    location: { lat: 17.4065, lng: 78.4382, address: 'Jubilee Hills, Hyderabad' },
    phone: '+91 40 2360 7777'
  },
  {
    id: 'p1',
    name: 'Suresh Reddy',
    role: 'PATIENT',
    email: 'suresh@example.com',
    location: { lat: 17.4401, lng: 78.3489, address: 'Gachibowli, Hyderabad' },
    phone: '+91 9123456780'
  },
  {
    id: 'a1',
    name: 'System Admin',
    role: 'ADMIN',
    email: 'admin@lifelink.com',
    location: { lat: 0, lng: 0, address: 'HQ' },
    phone: '000-000-0000'
  }
];

// Initial Requests
export const MOCK_REQUESTS: BloodRequest[] = [
  {
    id: 'r1',
    requesterId: 'h1',
    requesterName: 'Apollo Hospital',
    hospitalName: 'Apollo Hospital',
    bloodGroup: 'AB-',
    units: 2,
    urgency: 'CRITICAL',
    isPreBooking: false,
    requiredDate: new Date().toISOString(),
    location: { lat: 17.4065, lng: 78.4382, address: 'Jubilee Hills, Hyderabad' },
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    acceptedBy: []
  },
  {
    id: 'r2',
    requesterId: 'p1',
    requesterName: 'Suresh Reddy',
    hospitalName: 'NIMS',
    bloodGroup: 'O+',
    units: 1,
    urgency: 'NORMAL',
    isPreBooking: true,
    requiredDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days later
    location: { lat: 17.4401, lng: 78.3489, address: 'Gachibowli, Hyderabad' },
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    acceptedBy: ['d1'] // Mock accepted by Ravi
  }
];