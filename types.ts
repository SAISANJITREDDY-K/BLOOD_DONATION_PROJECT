export type Role = 'DONOR' | 'HOSPITAL' | 'PATIENT' | 'ADMIN';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type Urgency = 'CRITICAL' | 'HIGH' | 'NORMAL';
export type Status = 'PENDING' | 'ACCEPTED' | 'FULFILLED' | 'EXPIRED';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  bloodGroup?: BloodGroup;
  location: { lat: number; lng: number; address: string };
  isAvailable?: boolean; // For donors
  lastDonationDate?: string; // For donors
  donationCount?: number; // Total lifetime donations
  trustScore?: number; // Gamification
  badges?: string[]; // Gamification
  phone: string;
}

export interface BloodRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  hospitalName?: string;
  bloodGroup: BloodGroup;
  units: number;
  urgency: Urgency;
  isPreBooking: boolean; // Scheduled surgery vs Emergency
  requiredDate: string; // ISO date
  location: { lat: number; lng: number; address: string };
  status: Status;
  createdAt: string;
  acceptedBy?: string[]; // Donor IDs
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'ALERT' | 'INFO' | 'SUCCESS';
  timestamp: string;
  read: boolean;
}

export interface Translation {
  [key: string]: {
    en: string;
    te: string;
  };
}