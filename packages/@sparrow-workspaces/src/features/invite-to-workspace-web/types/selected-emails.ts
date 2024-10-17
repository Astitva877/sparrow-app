interface RoleWrapper {
  role: string;
}
interface EmailWrapper {
  email: string;
}

export interface SelectedEmails extends RoleWrapper, EmailWrapper {}
