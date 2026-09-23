import { getFirestore, collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp, onSnapshot, writeBatch } from 'firebase/firestore';
import { app } from './firebase';
import type { StudentRecord } from './academicNormalizer';
import { INITIAL_CLASS_IX_STUDENTS } from './initialClass9Data';

const db = getFirestore(app);

// ─── Constants ───
const ADMIN_PASSCODE = 'ccis-admin-2026';
const SCHOOL = 'CCIS';
const ALUMNI_DASHBOARD_URL = process.env.NEXT_PUBLIC_ALUMNI_DASHBOARD_URL || 'https://alumni-dashboard-39zq.vercel.app';
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120';

// ─── Admin Auth ───
export function adminAuth(passcode: string): boolean {
  return passcode === ADMIN_PASSCODE;
}

// ─── Announcements ───
const defaultAnnouncement = {
  active: true,
  message: 'CBSE & IB Admissions Open for Academic Session 2026-27. Book a personalized campus tour today.',
  linkText: 'Apply Now',
  linkUrl: '/admissions',
  type: 'admissions',
};

export async function fetchAnnouncement() {
  try {
    const docSnap = await getDoc(doc(db, 'site_settings', 'global_announcement'));
    return docSnap.exists() ? docSnap.data() : defaultAnnouncement;
  } catch {
    return defaultAnnouncement;
  }
}

export async function updateAnnouncement(data: { active?: boolean; message?: string; linkText?: string; linkUrl?: string; type?: string }) {
  const payload = {
    active: typeof data.active === 'boolean' ? data.active : true,
    message: data.message || defaultAnnouncement.message,
    linkText: data.linkText || '',
    linkUrl: data.linkUrl || '',
    type: data.type || 'admissions',
    updatedAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'site_settings', 'global_announcement'), payload);
  return payload;
}

// ─── Stats ───
const defaultStats = [
  { id: 'stat_1', end: 25, suffix: '+', label: 'Years of Excellence', order: 1 },
  { id: 'stat_2', end: 13500, suffix: '+', label: 'Alumni Network', order: 2 },
  { id: 'stat_3', end: 8, suffix: '+', label: 'Group Institutions', order: 3 },
  { id: 'stat_4', end: 100, suffix: '%', label: 'Board Pass Rate', order: 4 },
];

export async function fetchStats() {
  try {
    const docSnap = await getDoc(doc(db, 'site_settings', 'homepage_stats'));
    if (!docSnap.exists()) return defaultStats;
    return docSnap.data()?.stats || defaultStats;
  } catch {
    return defaultStats;
  }
}

export async function updateStats(stats: any[]) {
  await setDoc(doc(db, 'site_settings', 'homepage_stats'), {
    stats,
    updatedAt: new Date().toISOString(),
  });
  return stats;
}

const defaultFaculty = [
  { id: 'f0', name: 'Mrs. Lata Rawat', role: 'Director & Founding Mentor', dept: 'Leadership', qual: 'Edu Icon Awardee & Distinguished Educationist', img: '/images/lata-rawat.webp', order: 1 },
];

export async function fetchFaculty() {
  try {
    const q = query(collection(db, 'faculty_members'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return defaultFaculty;
    const faculty: any[] = [];
    snapshot.forEach((d) => faculty.push({ id: d.id, ...d.data() }));
    return faculty.length > 0 ? faculty : defaultFaculty;
  } catch {
    return defaultFaculty;
  }
}

export async function createFaculty(data: { name: string; role: string; dept: string; qual?: string; img?: string; order?: number }) {
  const docRef = doc(collection(db, 'faculty_members'));
  const newFaculty = {
    id: docRef.id,
    name: data.name,
    role: data.role,
    dept: data.dept,
    qual: data.qual || '',
    img: data.img || '/images/faculty-placeholder.jpg',
    order: Number(data.order) || 99,
    createdAt: new Date().toISOString(),
  };
  await setDoc(docRef, newFaculty);
  return newFaculty;
}

export async function updateFaculty(id: string, data: { name: string; role: string; dept: string; qual?: string; img?: string; order?: number }) {
  const docRef = doc(db, 'faculty_members', id);
  const updated = {
    name: data.name,
    role: data.role,
    dept: data.dept,
    qual: data.qual || '',
    img: data.img || '/images/faculty-placeholder.jpg',
    order: Number(data.order) || 99,
    updatedAt: new Date().toISOString(),
  };
  await setDoc(docRef, updated, { merge: true });
  return { id, ...updated };
}

export async function deleteFaculty(id: string) {
  await deleteDoc(doc(db, 'faculty_members', id));
}

// ─── News & Events ───
const defaultEvents = [
  {
    id: 'ccis_news_musicians_1',
    title: 'Young Musicians Display Talent on the Inter-School Stage',
    date: '2026-08-25',
    category: 'Cultural',
    img: '/images/news/news_music_talent.jpg',
    desc: 'CCIS students showcased stellar musical abilities in piano (Hridan Saraswat), drums (Nivan Sethi), guitar (Kishuk Sharma), and vocals (Mihira Purohit, Reet Kinra, Nirvi Maheshwari) at Dr Mool Chand Sethia Memorial Week.',
    featured: true,
    type: 'news',
    school: SCHOOL,
  },
  {
    id: 'ccis_news_competitions_2',
    title: "Students Shine Across Four Diverse Competition Categories at 'C'est Ton Moment'",
    date: '2026-08-20',
    category: 'Academic',
    img: '/images/news/news_competition_winners.jpg',
    desc: "CCIS students secured top positions across four categories: Puzzle, STEM Project Junior, Business Pitch, and Culinary Masters.",
    type: 'news',
    school: SCHOOL,
  },
  {
    id: 'ccis_news_parliament_3',
    title: 'When the Classroom Turns into Parliament: Intra-School Youth Parliament 2026',
    date: '2026-08-18',
    category: 'Academic',
    img: '/images/news/news_youth_parliament.jpg',
    desc: 'Classes VI-XI students gathered for an intra-school Youth Parliament at CCIS, debating national issues.',
    type: 'news',
    school: SCHOOL,
  },
  {
    id: 'ccis_news_citizenship_4',
    title: 'Students Take Pride in Spirit of Citizenship on Independence Day Celebrations',
    date: '2026-08-15',
    category: 'Cultural',
    img: '/images/news/news_citizenship_independence.jpg',
    desc: 'CCIS commemorated Independence Day with national flag hoisting, anthem, patriotic drama, and karate demonstrations.',
    type: 'news',
    school: SCHOOL,
  },
  {
    id: 'ccis_default_notice_1',
    title: 'Term-1 Examination Datesheet & Syllabus Circular',
    date: '2026-09-01',
    category: 'Academic',
    img: '/pdf-placeholder.png',
    desc: 'Detailed assessment schedules and curriculum criteria for Grades III-XII.',
    attachmentUrl: 'https://ccischool.org/wp-content/uploads/2026/02/syllabus.pdf',
    attachmentType: 'pdf',
    type: 'notice',
    school: SCHOOL,
  },
  {
    id: 'ccis_default_notice_2',
    title: 'Parent-Teacher Meeting Scheduling (Grade Nursery-XII)',
    date: '2026-08-28',
    category: 'Administrative',
    img: '/pdf-placeholder.png',
    desc: 'Important instructions regarding timeslots for the upcoming PTM.',
    attachmentUrl: 'https://ccischool.org/wp-content/uploads/2026/02/circular.pdf',
    attachmentType: 'pdf',
    type: 'notice',
    school: SCHOOL,
  },
];

export async function fetchNews() {
  try {
    const newsItems: any[] = [];
    try {
      const q = query(collection(db, 'news_updates'), where('school', '==', SCHOOL), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      snapshot.forEach((d) => newsItems.push({ id: d.id, ...d.data() }));
    } catch {
      const q = query(collection(db, 'news_updates'), where('school', '==', SCHOOL));
      const snapshot = await getDocs(q);
      snapshot.forEach((d) => newsItems.push({ id: d.id, ...d.data() }));
    }
    newsItems.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    if (newsItems.length === 0) return { news: defaultEvents, isDefault: true };
    return { news: newsItems, isDefault: false };
  } catch {
    return { news: defaultEvents, isDefault: true };
  }
}

export async function createNews(data: { title: string; date: string; category: string; desc: string; img?: string; featured?: boolean; attachmentUrl?: string; attachmentType?: string; type?: string }) {
  const docRef = doc(collection(db, 'news_updates'));

  // If featured, turn off other featured items
  if (data.featured) {
    const q = query(collection(db, 'news_updates'), where('school', '==', SCHOOL), where('featured', '==', true));
    const snapshot = await getDocs(q);
    const updates = snapshot.docs.map((d) => updateDoc(d.ref, { featured: false }));
    await Promise.all(updates);
  }

  const newEvent = {
    id: docRef.id,
    title: data.title,
    date: data.date,
    category: data.category,
    img: data.img || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800',
    desc: data.desc,
    featured: !!data.featured,
    attachmentUrl: data.attachmentUrl || null,
    attachmentType: data.attachmentType || null,
    type: data.type || 'news',
    school: SCHOOL,
    createdAt: new Date().toISOString(),
  };

  await setDoc(docRef, newEvent);
  return newEvent;
}

export async function updateNews(id: string, data: Record<string, any>) {
  const docRef = doc(db, 'news_updates', id);
  const updatedData: Record<string, any> = { updatedAt: new Date().toISOString(), school: SCHOOL };
  if (data.title !== undefined) updatedData.title = data.title;
  if (data.date !== undefined) updatedData.date = data.date;
  if (data.category !== undefined) updatedData.category = data.category;
  if (data.img !== undefined) updatedData.img = data.img;
  if (data.desc !== undefined) updatedData.desc = data.desc;
  if (data.featured !== undefined) updatedData.featured = !!data.featured;
  if (data.attachmentUrl !== undefined) updatedData.attachmentUrl = data.attachmentUrl;
  if (data.attachmentType !== undefined) updatedData.attachmentType = data.attachmentType;
  if (data.type !== undefined) updatedData.type = data.type;
  await setDoc(docRef, updatedData, { merge: true });
}

export async function deleteNews(id: string) {
  const docRef = doc(db, 'news_updates', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error('News item not found');
  if (docSnap.data()?.school !== SCHOOL) throw new Error('Unauthorized');
  await deleteDoc(docRef);
}

// ─── Contact Messages ───
export async function submitContactForm(data: { name: string; email: string; phone?: string; subject?: string; message: string }) {
  const docRef = doc(collection(db, 'contact_messages'));
  await setDoc(docRef, {
    id: docRef.id,
    name: data.name,
    email: data.email,
    phone: data.phone || '',
    subject: data.subject || 'General Inquiry',
    message: data.message,
    status: 'unread',
    createdAt: new Date().toISOString(),
  });
  return { success: true };
}

export async function fetchContactMessages() {
  const q = query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  const messages: any[] = [];
  snapshot.forEach((d) => messages.push({ id: d.id, ...d.data() }));
  return messages;
}

export async function updateContactMessage(id: string, status: string) {
  await updateDoc(doc(db, 'contact_messages', id), { status, updatedAt: new Date().toISOString() });
}

export async function deleteContactMessage(id: string) {
  await deleteDoc(doc(db, 'contact_messages', id));
}

// ─── Admission Enquiries ───
export async function submitAdmissionEnquiry(data: {
  name?: string; studentName?: string; dob?: string; gender?: string;
  parentName?: string; email: string; phone: string; grade: string;
  curriculum?: string; currentSchool?: string; visitDate?: string;
  visitTime?: string; message?: string;
}) {
  const applicantName = data.studentName || data.name || '';
  const parent = data.parentName || data.name || '';

  const docRef = doc(collection(db, 'admissions_enquiries'));
  const enquiryData = {
    id: docRef.id,
    name: applicantName,
    studentName: applicantName,
    parentName: parent,
    dob: data.dob || '',
    gender: data.gender || '',
    email: data.email,
    phone: data.phone,
    grade: data.grade,
    curriculum: data.curriculum || 'CBSE',
    currentSchool: data.currentSchool || '',
    visitDate: data.visitDate || '',
    visitTime: data.visitTime || '',
    message: data.message || '',
    school: SCHOOL,
    status: 'New',
    notes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(docRef, enquiryData);

  // Forward to Google Sheets
  const webhook = 'https://script.google.com/macros/s/AKfycbwWGA-DUq5kL-iXWQ3FNwBQChQy-Y14Q_XI8pytMYR0jkfpEIwrqrBYn_jrQFJgff0y/exec';
  fetch(webhook, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(enquiryData),
  }).catch((err) => console.error('Google Sheets sync error:', err));

  return enquiryData;
}

export async function fetchAdmissionEnquiries() {
  const enquiries: any[] = [];
  try {
    const q = query(collection(db, 'admissions_enquiries'), where('school', '==', SCHOOL), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    snapshot.forEach((d) => enquiries.push({ id: d.id, ...d.data() }));
  } catch {
    const q = query(collection(db, 'admissions_enquiries'), where('school', '==', SCHOOL));
    const snapshot = await getDocs(q);
    snapshot.forEach((d) => enquiries.push({ id: d.id, ...d.data() }));
    enquiries.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }
  return enquiries;
}

export async function updateAdmissionEnquiry(id: string, data: { status?: string; note?: string; notes?: any[] }) {
  const docRef = doc(db, 'admissions_enquiries', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error('Enquiry not found');

  const currentData = docSnap.data();
  const updatePayload: Record<string, any> = { updatedAt: new Date().toISOString() };

  if (data.status) updatePayload.status = data.status;
  if (data.note) {
    const existingNotes = currentData?.notes || [];
    updatePayload.notes = [...existingNotes, { text: data.note, createdAt: new Date().toISOString() }];
  } else if (data.notes) {
    updatePayload.notes = data.notes;
  }

  await updateDoc(docRef, updatePayload);
  return { id, ...currentData, ...updatePayload };
}

export async function deleteAdmissionEnquiry(id: string) {
  await deleteDoc(doc(db, 'admissions_enquiries', id));
}

// ─── Alumni ───
export async function fetchAlumni() {
  // 1. Fetch from Centralized Alumni Dashboard API
  try {
    const res = await fetch(`${ALUMNI_DASHBOARD_URL}/api/alumni`, {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0) {
        return list.map(({ phone, ...rest }: any) => {
          const avUrl = (rest.user?.avatarUrl && (rest.user.avatarUrl.startsWith('http') || rest.user.avatarUrl.startsWith('data:image/')))
            ? rest.user.avatarUrl
            : (rest.avatarUrl && (rest.avatarUrl.startsWith('http') || rest.avatarUrl.startsWith('data:image/')))
              ? rest.avatarUrl
              : (rest.avatar && (rest.avatar.startsWith('http') || rest.avatar.startsWith('data:image/')))
                ? rest.avatar
                : DEFAULT_AVATAR;
          return {
            ...rest,
            name: rest.user?.name || rest.name || 'Alumni Graduate',
            avatar: avUrl,
            avatarUrl: avUrl,
          };
        });
      }
    }
  } catch (apiErr) {
    console.warn('Alumni Dashboard API fetch failed, falling back to Firestore:', apiErr);
  }

  // 2. Direct Firestore fallback
  try {
    const q = query(collection(db, 'alumni_profiles'), where('isVerified', '==', true));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((d) => d.data());
    list.sort((a: any, b: any) => (b.batch || 0) - (a.batch || 0));

    return list.slice(0, 50).map(({ phone, ...rest }: any) => {
      const avUrl = (rest.user?.avatarUrl && (rest.user.avatarUrl.startsWith('http') || rest.user.avatarUrl.startsWith('data:image/')))
        ? rest.user.avatarUrl : DEFAULT_AVATAR;
      return { ...rest, avatar: avUrl, avatarUrl: avUrl };
    });
  } catch {
    return [];
  }
}

export async function registerAlumni(data: {
  name: string; email: string; batch: number; program: string;
  company?: string; role?: string; skills: string; linkedin?: string;
  phone?: string; city?: string; avatarUrl?: string; bio?: string;
}) {
  // Try forwarding to Alumni Dashboard first
  try {
    const res = await fetch(`${ALUMNI_DASHBOARD_URL}/api/alumni`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, batch: Number(data.batch), school: SCHOOL }),
    });
    if (res.ok) return await res.json();
  } catch {
    console.warn('Alumni Dashboard forwarding failed, using direct Firestore.');
  }

  // Check for existing user
  const userQ = query(collection(db, 'users'), where('email', '==', data.email));
  const userSnapshot = await getDocs(userQ);

  if (!userSnapshot.empty) {
    const existingUser = userSnapshot.docs[0];
    const profileQ = query(collection(db, 'alumni_profiles'), where('userId', '==', existingUser.id));
    const profileSnapshot = await getDocs(profileQ);
    if (!profileSnapshot.empty) throw new Error('An account with this email already exists');
    await deleteDoc(existingUser.ref);
  }

  // Create user doc
  const userRef = doc(collection(db, 'users'));
  const userData = {
    id: userRef.id,
    email: data.email,
    name: data.name,
    role: 'ALUMNI',
    avatarUrl: data.avatarUrl || DEFAULT_AVATAR,
  };
  await setDoc(userRef, userData);

  // Create alumni profile
  const profileRef = doc(collection(db, 'alumni_profiles'));
  const profileData = {
    id: profileRef.id,
    userId: userRef.id,
    batch: Number(data.batch),
    program: data.program,
    school: SCHOOL,
    company: data.company || '',
    role: data.role || '',
    industry: data.skills.split(',')[0]?.trim() || 'General',
    country: 'India',
    city: data.city || 'Jaipur',
    skills: data.skills,
    isVerified: false,
    isEmailVerified: false,
    isMentor: false,
    profileComplete: data.bio ? 55 : 40,
    user: userData,
    linkedin: data.linkedin || '',
    phone: data.phone || '',
    bio: data.bio || '',
  };
  await setDoc(profileRef, profileData);

  // Create testimonial placeholder
  const testimonialRef = doc(collection(db, 'widget_testimonials'));
  await setDoc(testimonialRef, {
    id: testimonialRef.id,
    alumniProfileId: profileRef.id,
    quote: `${data.name} registered as a graduate from Batch of ${data.batch}.`,
    isApproved: false,
    alumni: profileData,
  });

  return { success: true, profile: profileData };
}

const PROMINENT_ENTITIES = ['google', 'microsoft', 'meta', 'apple', 'tesla', 'amazon', 'deloitte', 'ey', 'tcs', 'ias', 'ips', 'aiims'];

export async function fetchTopAlumni() {
  try {
    const q = query(collection(db, 'alumni_profiles'), where('isVerified', '==', true));
    const snapshot = await getDocs(q);
    const profiles = snapshot.docs.map((d) => d.data());

    const scored = profiles.map((p: any) => {
      let score = p.profileComplete || 0;
      const country = (p.country || '').trim().toLowerCase();
      if (country && country !== 'india') score += 100;
      if (p.isMentor) score += 50;
      const company = (p.company || '').trim().toLowerCase();
      const role = (p.role || '').trim().toLowerCase();
      if (company && role) score += 30;
      if (PROMINENT_ENTITIES.some((e) => company.includes(e) || role.includes(e))) score += 20;
      if ((p.bio || '').trim().length > 20) score += 15;
      score += (Number(p.batch) - 2000) * 0.1;
      return { profile: p, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 30).map(({ profile: p }) => {
      const avUrl = (p.user?.avatarUrl && (p.user.avatarUrl.startsWith('http') || p.user.avatarUrl.startsWith('data:image/')))
        ? p.user.avatarUrl : DEFAULT_AVATAR;
      return {
        id: p.id, name: p.user?.name || 'Alumni', batch: p.batch, program: p.program,
        school: p.school, company: p.company || '', role: p.role || '', skills: p.skills || '',
        bio: p.bio || '', city: p.city || '', country: p.country || 'India',
        linkedin: p.linkedin || '', avatar: avUrl, avatarUrl: avUrl,
      };
    });
  } catch {
    return [];
  }
}

// ─── Alumni Management (Admin) ───
export async function fetchAlumniManage() {
  // 1. Try centralized Alumni Dashboard API first
  try {
    const res = await fetch(`${ALUMNI_DASHBOARD_URL}/api/alumni`);
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch {
    // Continue to Firestore fallback
  }

  const profiles: any[] = [];
  try {
    const q = query(collection(db, 'alumni_profiles'), orderBy('batch', 'desc'));
    const snapshot = await getDocs(q);
    snapshot.forEach((d) => profiles.push({ id: d.id, ...d.data() }));
  } catch {
    const snapshot = await getDocs(collection(db, 'alumni_profiles'));
    snapshot.forEach((d) => profiles.push({ id: d.id, ...d.data() }));
    profiles.sort((a, b) => (Number(b.batch) || 0) - (Number(a.batch) || 0));
  }
  return profiles;
}

export async function updateAlumniProfile(id: string, data: { isVerified?: boolean; isMentor?: boolean; isFeatured?: boolean }) {
  const docRef = doc(db, 'alumni_profiles', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error('Profile not found');

  const updatePayload: Record<string, any> = { updatedAt: new Date().toISOString() };
  if (typeof data.isVerified === 'boolean') updatePayload.isVerified = data.isVerified;
  if (typeof data.isMentor === 'boolean') updatePayload.isMentor = data.isMentor;
  if (typeof data.isFeatured === 'boolean') updatePayload.isFeatured = data.isFeatured;

  await updateDoc(docRef, updatePayload);
  return { id, ...docSnap.data(), ...updatePayload };
}

export async function deleteAlumniProfile(id: string) {
  await deleteDoc(doc(db, 'alumni_profiles', id));
}

// ─── Testimonials ───
const defaultTestimonials = {
  parent: [
    { id: 'p1', img: 'parent1.png', videoId: '3adNiVmDkws' },
    { id: 'p2', img: 'parent2.png', videoId: '57c5x8jQINM' },
    { id: 'p3', img: 'parent3.png', videoId: 'NgG6gWQETqU' },
    { id: 'p4', img: 'parent4.png', videoId: 'Kw_p90p20Ns' },
  ],
  student: [
    { id: 's1', img: 'student1.png', videoId: 'd66JSRy8GwE' },
    { id: 's2', img: 'student2.png', videoId: 'XWpU8A4BoHE' },
    { id: 's3', img: 'student3.png', videoId: 'G5f7788rAbg' },
    { id: 's4', img: 'student4.png', videoId: 'CkP3EudkpRQ' },
  ],
};

export async function fetchTestimonials() {
  try {
    const snapshot = await getDocs(collection(db, 'testimonials'));
    if (snapshot.empty) return defaultTestimonials;

    const parent: any[] = [];
    const student: any[] = [];
    snapshot.docs.forEach((d) => {
      const data = d.data();
      const item = { id: d.id, ...data };
      if (data.type === 'parent') parent.push(item);
      else student.push(item);
    });

    return {
      parent: parent.length > 0 ? parent : defaultTestimonials.parent,
      student: student.length > 0 ? student : defaultTestimonials.student,
    };
  } catch {
    return defaultTestimonials;
  }
}

export async function createTestimonial(data: { type: string; img?: string; videoId: string }) {
  const docRef = await addDoc(collection(db, 'testimonials'), {
    type: data.type,
    img: data.img || (data.type === 'parent' ? 'parent1.png' : 'student1.webp'),
    videoId: data.videoId,
    createdAt: new Date().toISOString(),
  });
  return { id: docRef.id };
}

export async function deleteTestimonial(id: string) {
  await deleteDoc(doc(db, 'testimonials', id));
}

// ─── Email Verification (Client-side) ───
export async function verifyAlumniEmail(profileId: string) {
  const profileRef = doc(db, 'alumni_profiles', profileId);
  const docSnap = await getDoc(profileRef);

  if (!docSnap.exists()) throw new Error('Profile not found');

  await updateDoc(profileRef, { isEmailVerified: true });

  // Update testimonial if exists
  const q = query(collection(db, 'widget_testimonials'), where('alumniProfileId', '==', profileId));
  const testSnapshot = await getDocs(q);
  if (!testSnapshot.empty) {
    const testDoc = testSnapshot.docs[0];
    const testData = testDoc.data();
    if (testData?.alumni) {
      testData.alumni.isEmailVerified = true;
      await updateDoc(testDoc.ref, { alumni: testData.alumni });
    }
  }

  return docSnap.data();
}

// ─── Class IX Student Performance & Target Tracker ───

export async function fetchStudentById(studentId: string): Promise<StudentRecord | null> {
  try {
    const docRef = doc(db, 'students', studentId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data() as StudentRecord;
  } catch (error) {
    console.warn(`Firestore read fallback for student ${studentId}:`, error);
  }
  return INITIAL_CLASS_IX_STUDENTS.find((s) => s.studentId === studentId) || null;
}

export function subscribeStudentById(
  studentId: string,
  onUpdate: (data: StudentRecord | null) => void,
  onError?: (err: any) => void
): () => void {
  const fallback = INITIAL_CLASS_IX_STUDENTS.find((s) => s.studentId === studentId) || null;

  try {
    const docRef = doc(db, 'students', studentId);
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate(docSnap.data() as StudentRecord);
        } else {
          onUpdate(fallback);
        }
      },
      (error) => {
        console.warn(`Firestore subscription fallback for ${studentId}:`, error);
        onUpdate(fallback);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Realtime subscription error, using static fallback:', err);
    onUpdate(fallback);
    return () => {};
  }
}

export interface StudentDirectoryItem {
  studentId: string;
  name: string;
  group: 'AURA' | 'ZEN' | 'NEO';
  enrollmentNumber: string;
  overallDisplay?: string;
  hasTarget: boolean;
}

export async function fetchStudentDirectory(): Promise<StudentDirectoryItem[]> {
  try {
    const q = query(collection(db, 'students'), where('class', '==', 'IX'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const directory: StudentDirectoryItem[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as StudentRecord;
        directory.push({
          studentId: data.studentId || d.id,
          name: data.name,
          group: data.group,
          enrollmentNumber: data.enrollmentNumber,
          overallDisplay: data.currentPerformance?.overall?.displayValue,
          hasTarget: data.schoolTarget?.overall?.type === 'exact' || data.schoolTarget?.overall?.type === 'range',
        });
      });

      directory.sort((a, b) => {
        if (a.group !== b.group) return a.group.localeCompare(b.group);
        return a.name.localeCompare(b.name);
      });

      return directory;
    }
  } catch (error) {
    console.warn('Directory read fallback to initial dataset:', error);
  }

  // Fallback to initial 97 students
  const fallbackList: StudentDirectoryItem[] = INITIAL_CLASS_IX_STUDENTS.map((s) => ({
    studentId: s.studentId,
    name: s.name,
    group: s.group,
    enrollmentNumber: s.enrollmentNumber,
    overallDisplay: s.currentPerformance?.overall?.displayValue,
    hasTarget: s.schoolTarget?.overall?.type === 'exact' || s.schoolTarget?.overall?.type === 'range',
  }));

  fallbackList.sort((a, b) => {
    if (a.group !== b.group) return a.group.localeCompare(b.group);
    return a.name.localeCompare(b.name);
  });

  return fallbackList;
}

export async function syncStudentRecords(
  records: StudentRecord[],
  syncSource = 'Google Sheets Apps Script'
) {
  const BATCH_SIZE = 450;
  const startedAt = new Date().toISOString();
  let successful = 0;
  let failed = 0;
  const errors: any[] = [];

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = records.slice(i, i + BATCH_SIZE);

    for (const record of chunk) {
      if (!record.studentId) {
        failed++;
        errors.push({ student: record.name, error: 'Missing studentId' });
        continue;
      }
      const ref = doc(db, 'students', record.studentId);
      batch.set(ref, record, { merge: true });
      successful++;
    }

    try {
      await batch.commit();
    } catch (err: any) {
      console.error('Batch commit failed:', err);
      failed += chunk.length;
      errors.push({ batchIndex: i, error: err.message || String(err) });
    }
  }

  // Create sync log
  const logRef = doc(collection(db, 'sync_logs'));
  await setDoc(logRef, {
    id: logRef.id,
    syncSource,
    startedAt,
    completedAt: new Date().toISOString(),
    totalRows: records.length,
    successfulRows: successful,
    failedRows: failed,
    errors,
  });

  return {
    success: failed === 0,
    total: records.length,
    successful,
    failed,
    logId: logRef.id,
  };
}

