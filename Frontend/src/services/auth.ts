export type AuthUser = {
  id: string;
  name: string;
  nickname?: string;
  email: string;
  state?: string;
  city?: string;
  userType: 'ambassador' | 'student';
  avatarPath?: string;
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  phone?: string;
  avatarFrame: AvatarFrame;
  groupCode?: string;
  groupNumber?: number;
};

export type AvatarFrame = 'none' | 'google' | 'gold' | 'rainbow' | 'campus' | 'gemini' | 'orbit' | 'pixel' | 'network' | 'constellation' | 'chrome' | 'android' | 'cloud' | 'firebase' | 'maps' | 'codejam' | 'community' | 'prism' | 'devfest' | 'studio' | 'spark' | 'material' | 'heart' | 'applause' | 'comet' | 'aura' | 'mosaic';
export type ProfileInput = Pick<AuthUser, 'nickname' | 'bio' | 'githubUrl' | 'linkedinUrl' | 'instagramUrl' | 'phone' | 'avatarFrame'> & { groupNumber?: number };

export type University = { id: string; name: string };

export type Campus = {
  id: string;
  name: string;
  slug: string;
  description: string;
  emailDomains: string[];
  city?: string;
  state?: string;
  region?: string;
  country?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  totalMembers?: number;
  ambassadorCount?: number;
  eventsCount?: number;
  stats?: { totalMembers: number; ambassadorCount: number };
};

export type CampusMemberInfo = {
  role: 'STUDENT' | 'AMBASSADOR' | 'CAMPUS_ADMIN';
  status: 'ACTIVE' | 'PENDING' | 'BLOCKED';
  isMember: boolean;
  isAmbassador: boolean;
};

export type CampusViewResponse = {
  campus: Campus;
  membership: CampusMemberInfo | null;
  ambassadors: AmbassadorDirectoryItem[];
};

export type CampusResourceItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  level: string;
  isCampusExclusive: boolean;
  url: string;
};

export type CampusGeminiModule = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export type CommunityEvent = {
  id: string; title: string; description: string; startsAt: string; endsAt?: string; location: string; createdAt: string;
  city: string; state: string; coordinates?: EventCoordinates;
  visibility?: 'GLOBAL' | 'CAMPUS';
  campusId?: string;
  capacity: number | null; availableSpots: number | null; imageUrls: string[]; tags: string[];
  participantCount: number; isParticipating: boolean; isOwner: boolean; isOrganizer: boolean; organizerCount: number; forumId?: string; groupId?: string; groupIds: string[];
};

export type EventCoordinates = { lat: number; lng: number };
export type EventParticipant = Pick<AuthUser, 'id' | 'name' | 'nickname' | 'userType' | 'avatarPath' | 'avatarFrame' | 'state' | 'city'> & { universityName: string };
export type EventDetails = {
  event: CommunityEvent;
  organizer?: EventParticipant;
  organizers: EventParticipant[];
  participants: EventParticipant[];
  ambassadorParticipants: EventParticipant[];
  news: EventNews[];
};
export type EventNews = { id: string; content: string; createdAt: string; author?: EventParticipant };
export type EventDirectoryItem = CommunityEvent & { organizer?: EventParticipant };
export type ForumDirectoryItem = {
  id: string; title: string; description: string; createdAt: string; memberCount: number; isParticipating: boolean;
  organizer?: EventParticipant;
};
export type CommunityForum = {
  id: string; title: string; description: string; createdAt: string;
  memberCount: number; isParticipating: boolean; isOwner: boolean;
};
export type CommunityGroup = {
  id: string; name: string; description: string; createdAt: string;
  memberCount: number; isParticipating: boolean; isOwner: boolean;
};
export type Badge = {
  id: 'campus' | 'forum-host' | 'forum-member' | 'first-message' | 'event-maker' | 'event-explorer' | 'group-builder' | 'group-member' | 'connector' | 'profile-ready' | 'profile-love' | 'comment-love' | 'supporter';
  title: string; description: string; earnedAt: string; tone: 'blue' | 'red' | 'yellow' | 'green' | 'purple';
  level: number; maxLevel: number; progress: number; target: number; nextTarget?: number;
};
export type ForumMessage = { id: string; content: string; createdAt: string; parentMessageId?: string; isDeleted: boolean; likes: number; likedByMe: boolean; mentionedUserIds: string[]; author: Pick<AuthUser, 'id' | 'name' | 'nickname' | 'avatarPath' | 'avatarFrame'> };
export type ForumMember = Pick<AuthUser, 'id' | 'name' | 'nickname' | 'avatarPath' | 'avatarFrame'> & { role: 'owner' | 'admin' | 'moderator' | 'member'; mutedUntil?: string; readOnly: boolean; banned: boolean; isBot: boolean };
export type GroupInvitee = Pick<AuthUser, 'id' | 'name' | 'nickname' | 'avatarPath' | 'avatarFrame'>;
export type DashboardData = {
  profile: AuthUser & { universityName: string; inviteCode?: string };
  stats: { eventsCreated: number; eventsParticipating: number; forumsCreated: number; forumsParticipating: number; groupsCreated: number; groupsParticipating: number };
  upcomingEvents: CommunityEvent[]; activeForums: CommunityForum[]; groups: CommunityGroup[]; badges: Badge[];
};
export type PublicProfileData = {
  profile: Omit<AuthUser, 'email' | 'phone'> & { universityName: string; joinedAt: string; likes: number; likedByMe: boolean };
  stats: { eventsCreated: number; forumsCreated: number; groupsCreated: number; badgesEarned: number };
  badges: Badge[];
};
export type AmbassadorDirectoryItem = {
  id: string;
  name: string;
  nickname?: string;
  avatarPath?: string;
  avatarFrame: AvatarFrame;
  bio?: string;
  state: string;
  city: string;
  region?: string;
  course?: string;
  universityName: string;
  campusSlug?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  likes: number;
  likedByMe: boolean;
};

export type AnnouncementItem = {
  id: string;
  title: string;
  content: string;
  summary: string;
  visibility: 'GLOBAL' | 'CAMPUS';
  campusId?: string | null;
  category: 'GENERAL' | 'FEATURE' | 'EVENT' | 'OPPORTUNITY' | 'ACADEMIC';
  authorName: string;
  isPinned: boolean;
  publishedAt: string;
};

export type MacroRegion = {
  slug: string;
  name: string;
  description: string;
  states: string[];
  totalAmbassadors?: number;
};

export type AmbassadorPublicProfile = {
  id: string;
  name: string;
  nickname: string;
  avatarPath?: string;
  avatarFrame: AvatarFrame;
  bio: string;
  state: string;
  city: string;
  region: string;
  course: string;
  universityName: string;
  campusSlug: string;
  campusName: string;
  githubUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  likes: number;
  likedByMe: boolean;
  userType: 'ambassador' | 'student';
  joinedAt: string;
};

type EventInput = {
  title: string;
  description: string;
  startsAt: string;
  endsAt?: string;
  location: string;
  city?: string;
  state?: string;
  coordinates?: EventCoordinates;
  capacity?: number;
  visibility?: 'GLOBAL' | 'CAMPUS';
  campusId?: string;
  imageUrls: string[];
  tags: string[];
  organizerIds?: string[];
  groupId?: string;
  createForum?: boolean;
};
type EventUpdateInput = Partial<Omit<EventInput, 'organizerIds' | 'groupId' | 'createForum'>>;
type DiscussionInput = { title?: string; name?: string; description: string };
type SessionResponse = { user: AuthUser };
type LoginInput = { email: string; password: string };
export type RegistrationResponse = { email: string; message: string };
export type EmailPreferenceCategory = 'eventUpdates' | 'forumUpdates' | 'productUpdates';

const isLocalDevelopmentHost = /(^|\.)localhost$/i.test(window.location.hostname) || window.location.hostname === '127.0.0.1';
const runtimeConfig = globalThis as typeof globalThis & { __GSA_API_URL__?: string };
const apiBaseUrl = runtimeConfig.__GSA_API_URL__
  ?? (isLocalDevelopmentHost ? 'http://localhost:3001' : '');
const apiUrl = `${apiBaseUrl}/api/2026/google`;
const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    credentials: 'include',
    headers: isFormData ? options.headers : { 'Content-Type': 'application/json', ...options.headers },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(body?.error ?? 'Não foi possível concluir sua solicitação.');
  }

  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
};

export const getAvatarUrl = (avatarPath?: string) => avatarPath ? `${apiBaseUrl}${avatarPath}` : undefined;

export const authApi = {
  getSession: () => request<SessionResponse>('/user/me'),
  login: (input: LoginInput) => request<SessionResponse>('/user/login', { method: 'POST', body: JSON.stringify(input) }),
  register: (input: FormData) => request<RegistrationResponse>('/user/register', { method: 'POST', body: input }),
  validateGroupInviteCode: (code: string) => request<{ valid: true; code: string; groupNumber: number }>(`/user/group-invitations/${encodeURIComponent(code)}`),
  verifyEmail: (token: string) => request<SessionResponse>('/user/email-verification/verify', { method: 'POST', body: JSON.stringify({ token }) }),
  resendVerification: (email: string) => request<{ message: string }>('/user/email-verification/resend', { method: 'POST', body: JSON.stringify({ email }) }),
  requestPasswordReset: (email: string) => request<{ message: string }>('/user/password-reset/request', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token: string, password: string) => request<{ message: string }>('/user/password-reset/confirm', { method: 'POST', body: JSON.stringify({ token, password }) }),
  unsubscribeEmailCategory: (token: string, category: EmailPreferenceCategory) => request<{ message: string; preferences: Record<EmailPreferenceCategory, boolean> }>('/user/email-preferences/unsubscribe', { method: 'POST', body: JSON.stringify({ token, category }) }),
  logout: () => request<void>('/user/logout', { method: 'POST' }),
  updateProfile: (input: ProfileInput) => request<SessionResponse>('/user/profile', { method: 'PATCH', body: JSON.stringify(input) }),
  searchUniversities: async (query: string) => {
    const response = await request<{ universities: University[] }>(`/university/search?q=${encodeURIComponent(query)}`);
    return response.universities;
  },
  // Multi-campus API
  createCampus: (data: { name: string; slug?: string; emailDomains: string[]; city?: string; state?: string }) => request<{ campus: Campus }>('/campuses', { method: 'POST', body: JSON.stringify(data) }),
  updateCampus: (campusSlug: string, input: Partial<Campus>) => request<{ campus: Campus }>(`/campuses/${campusSlug}`, { method: 'PATCH', body: JSON.stringify(input) }),
  listCampuses: (params?: { query?: string; region?: string; state?: string; city?: string; hasEvents?: boolean; hasAmbassadors?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.query) query.set('query', params.query);
    if (params?.region) query.set('region', params.region);
    if (params?.state) query.set('state', params.state);
    if (params?.city) query.set('city', params.city);
    if (params?.hasEvents) query.set('hasEvents', 'true');
    if (params?.hasAmbassadors) query.set('hasAmbassadors', 'true');
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ campuses: Campus[] }>(`/campuses/${qs}`);
  },
  getCampus: (campusSlug: string) => request<CampusViewResponse>(`/campuses/${campusSlug}`),
  getCampusAbout: (campusSlug: string) => request<CampusViewResponse>(`/campuses/${campusSlug}/about`),
  getCampusEvents: (campusSlug: string) => request<{ campus: Campus; isMember: boolean; events: EventDirectoryItem[] }>(`/campuses/${campusSlug}/events`),
  getCampusWorkshops: (campusSlug: string) => request<{ campus: Campus; isMember: boolean; workshops: EventDirectoryItem[] }>(`/campuses/${campusSlug}/workshops`),
  getCampusResources: (campusSlug: string) => request<{ campus: Campus; isMember: boolean; resources: CampusResourceItem[] }>(`/campuses/${campusSlug}/resources`),
  getCampusGeminiHub: (campusSlug: string) => request<{ campus: Campus; isMember: boolean; modules: CampusGeminiModule[] }>(`/campuses/${campusSlug}/gemini`),
  joinCampus: (campusSlug: string) => request<{ message: string; membership: CampusMemberInfo }>(`/campuses/${campusSlug}/join`, { method: 'POST' }),
  getUserCampuses: () => request<{ campuses: Array<Campus & { role: string; joinedAt: string }> }>('/user/me/campuses'),

  // Connect Hub & Ambassadors
  getAmbassadors: (params?: { campus?: string; region?: string; state?: string; city?: string; search?: string; course?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.campus) query.set('campus', params.campus);
    if (params?.region) query.set('region', params.region);
    if (params?.state) query.set('state', params.state);
    if (params?.city) query.set('city', params.city);
    if (params?.search) query.set('search', params.search);
    if (params?.course) query.set('course', params.course);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ total: number; page: number; limit: number; ambassadors: AmbassadorDirectoryItem[] }>(`/connect/ambassadors${qs}`);
  },
  getAmbassadorProfile: (idOrUsername: string) => request<{ profile: AmbassadorPublicProfile }>(`/connect/ambassadors/${idOrUsername}`),
  getRegions: () => request<{ regions: MacroRegion[] }>('/connect/regions'),
  getMapConfig: () => request<{ googleMapsApiKey: string; googleMapId: string }>('/connect/map-config'),
  getRegionDetails: (regionSlug: string) => request<{ region: MacroRegion; ambassadors: AmbassadorDirectoryItem[] }>(`/connect/regions/${regionSlug}`),
  getAnnouncements: (params?: { category?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ total: number; page: number; limit: number; announcements: AnnouncementItem[] }>(`/connect/announcements${qs}`);
  },
  createAnnouncement: (input: { title: string; content: string; summary?: string; visibility: 'GLOBAL' | 'CAMPUS'; campusId?: string; category?: string }) =>
    request<{ message: string; announcement: AnnouncementItem }>('/connect/announcements', { method: 'POST', body: JSON.stringify(input) }),

  // Global Events Hub
  getGlobalEvents: (params?: { timeframe?: 'upcoming' | 'past' | 'month' | 'all'; tag?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.timeframe) query.set('timeframe', params.timeframe);
    if (params?.tag) query.set('tag', params.tag);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ total: number; page: number; limit: number; events: EventDirectoryItem[] }>(`/events/global${qs}`);
  },

  getDashboard: () => request<DashboardData>('/user/dashboard'),
  getPublicProfile: (id: string) => request<PublicProfileData>(`/user/public/${id}`),
  toggleProfileLike: (id: string) => request<{ likes: number; likedByMe: boolean }>(`/user/public/${id}/like`, { method: 'POST' }),
  listAmbassadors: () => request<{ ambassadors: AmbassadorDirectoryItem[] }>('/user/ambassadors'),
  toggleAmbassadorLike: (id: string) => request<{ likes: number; likedByMe: boolean }>(`/user/ambassadors/${id}/like`, { method: 'POST' }),
  listEvents: () => request<{ events: CommunityEvent[] }>('/events/'),
  discoverEvents: () => request<{ events: EventDirectoryItem[] }>('/events/discover'),
  createEvent: (input: EventInput) => request<{ event: CommunityEvent }>('/events/', { method: 'POST', body: JSON.stringify(input) }),
  getEvent: (id: string) => request<EventDetails>(`/events/${id}`),
  updateEvent: (id: string, input: EventUpdateInput) => request<{ event: CommunityEvent }>(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteEvent: (id: string) => request<void>(`/events/${id}`, { method: 'DELETE' }),
  addEventOrganizer: (eventId: string, userId: string) => request<{ event: CommunityEvent }>(`/events/${eventId}/organizers`, { method: 'POST', body: JSON.stringify({ userId }) }),
  addEventOrganizerGroup: (eventId: string, groupId: string) => request<{ event: CommunityEvent }>(`/events/${eventId}/organizer-groups`, { method: 'POST', body: JSON.stringify({ userId: groupId }) }),
  removeEventOrganizer: (eventId: string, userId: string) => request<{ event: CommunityEvent }>(`/events/${eventId}/organizers/${userId}`, { method: 'DELETE' }),
  addEventNews: (eventId: string, content: string) => request<{ event: CommunityEvent }>(`/events/${eventId}/news`, { method: 'POST', body: JSON.stringify({ content }) }),
  createEventForum: (eventId: string) => request<{ event: CommunityEvent }>(`/events/${eventId}/forum`, { method: 'POST' }),
  setEventParticipation: (id: string, isParticipating: boolean) => request<{ event: CommunityEvent }>(`/events/${id}/participation`, { method: isParticipating ? 'POST' : 'DELETE' }),
  listForums: () => request<{ forums: CommunityForum[] }>('/forums/'),
  discoverForums: () => request<{ forums: ForumDirectoryItem[] }>('/forums/discover'),
  getForum: (id: string) => request<{ forum: CommunityForum }>(`/forums/${id}`),
  createForum: (input: Required<Pick<DiscussionInput, 'title' | 'description'>>) => request<{ forum: CommunityForum }>('/forums/', { method: 'POST', body: JSON.stringify(input) }),
  updateForum: (id: string, input: Required<Pick<DiscussionInput, 'title' | 'description'>>) => request<{ forum: CommunityForum }>(`/forums/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  setForumParticipation: (id: string, isParticipating: boolean) => request<{ forum: CommunityForum }>(`/forums/${id}/participation`, { method: isParticipating ? 'POST' : 'DELETE' }),
  deleteForum: (id: string) => request<void>(`/forums/${id}`, { method: 'DELETE' }),
  listForumMessages: (id: string) => request<{ messages: ForumMessage[] }>(`/forums/${id}/messages`),
  sendForumMessage: (id: string, content: string, parentMessageId?: string) => request<{ message: ForumMessage }>(`/forums/${id}/messages`, { method: 'POST', body: JSON.stringify({ content, parentMessageId }) }),
  toggleForumMessageLike: (forumId: string, messageId: string) => request<{ message: ForumMessage }>(`/forums/${forumId}/messages/${messageId}/like`, { method: 'POST' }),
  listForumMembers: (forumId: string) => request<{ members: ForumMember[] }>(`/forums/${forumId}/members`),
  updateForumMember: (forumId: string, userId: string, input: Partial<Pick<ForumMember, 'role' | 'readOnly'>> & { mutedForMinutes?: number; banned?: boolean }) => request<void>(`/forums/${forumId}/members/${userId}`, { method: 'PATCH', body: JSON.stringify(input) }),
  removeForumMember: (forumId: string, userId: string) => request<void>(`/forums/${forumId}/members/${userId}`, { method: 'DELETE' }),
  listGroups: () => request<{ groups: CommunityGroup[] }>('/groups/'),
  createGroup: (input: Required<Pick<DiscussionInput, 'name' | 'description'>>) => request<{ group: CommunityGroup }>('/groups/', { method: 'POST', body: JSON.stringify(input) }),
  updateGroup: (id: string, input: Required<Pick<DiscussionInput, 'name' | 'description'>>) => request<{ group: CommunityGroup }>(`/groups/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteGroup: (id: string) => request<void>(`/groups/${id}`, { method: 'DELETE' }),
  listGroupInvitations: () => request<{ groups: CommunityGroup[] }>('/groups/invitations'),
  listPendingGroupMembers: (groupId: string) => request<{ members: GroupInvitee[] }>(`/groups/${groupId}/pending-members`),
  inviteGroupMember: (groupId: string, userId: string) => request<{ group: CommunityGroup }>(`/groups/${groupId}/invitations`, { method: 'POST', body: JSON.stringify({ userId }) }),
  respondToGroupInvitation: (groupId: string, accept: boolean) => request<{ group: CommunityGroup }>(`/groups/${groupId}/invitations/respond`, { method: 'POST', body: JSON.stringify({ accept }) }),
  setGroupParticipation: (id: string, isParticipating: boolean) => request<{ group: CommunityGroup }>(`/groups/${id}/participation`, { method: isParticipating ? 'POST' : 'DELETE' }),
};
