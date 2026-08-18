export interface OrganizationProfile {
  id: string;
  name: string;
  legalName: string;
  industry: string;
  size: string;
  domain: string;
  logoInitials: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  country: string;
  timezone: string;
  currency: string;
  language: string;
  fiscalYearStart: string;
}

export const organizationProfile: OrganizationProfile = {
  id: "org_mvx_9a72cdb1",
  name: "MaVionix Labs",
  legalName: "MaVionix Technologies Pvt. Ltd.",
  industry: "Technology",
  size: "11-50",
  domain: "mavionix.internal",
  logoInitials: "ML",
  email: "admin@mavionix.io",
  phone: "+91 98765 43210",
  website: "https://mavionix.io",
  address: "Whitefield, Bangalore, Karnataka",
  country: "India",
  timezone: "IST",
  currency: "INR",
  language: "en",
  fiscalYearStart: "April",
};
