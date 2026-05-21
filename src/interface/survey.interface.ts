/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ISurveyResponses {
    id?: string;
    form_id: string;
    client_id: string;
    advisor_id: string;
    answers: Record<string, any>;
    created_at?: string | Date;
    client?: {
        contact_name: string;
    };
    advisor?: {
        contact_name: string;
    };
}

export interface IUser {
  id: string;
  contact_name: string;
  role: string;
  url_logo?: string | null;
  url_logo_signed?: string | null;
}