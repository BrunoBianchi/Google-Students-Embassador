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
};

export type AvatarFrame = 'none' | 'google' | 'gold' | 'rainbow' | 'campus' | 'gemini' | 'orbit' | 'pixel' | 'network' | 'constellation' | 'chrome' | 'android' | 'cloud' | 'firebase' | 'maps' | 'codejam' | 'community' | 'prism' | 'devfest' | 'studio' | 'spark' | 'material' | 'heart' | 'applause' | 'comet' | 'aura' | 'mosaic';
export type ProfileInput = Pick<AuthUser, 'nickname' | 'bio' | 'githubUrl' | 'linkedinUrl' | 'instagramUrl' | 'phone' | 'avatarFrame'>;

export type University = { id: string; name: string };
export type CommunityEvent = {
  id: string; title: string; description: string; startsAt: string; endsAt?: string; location: string; createdAt: string;
  city: string; state: string; coordinates?: EventCoordinates;
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
  universityName: string;
  likes: number;
  likedByMe: boolean;
};
type EventInput = { title: string; description: string; startsAt: string; endsAt?: string; location: string; city?: string; state?: string; coordinates?: EventCoordinates; capacity?: number; imageUrls: string[]; tags: string[]; organizerIds?: string[]; groupId?: string; createForum?: boolean };
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
