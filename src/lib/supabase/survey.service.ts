/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from ".";
import type { IUser } from "../../interface/survey.interface";
import { fetchSignedUrls } from "../uploads";

export const getSurveyById = async (
  id: string
) => {
  const { data, error } = await supabase
    .from("survey_forms")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getAdvisors = async (): Promise<IUser[]> => {
  const { data, error } = await supabase
    .from("users")
    .select(`
      id,
      contact_name,
      role,
      url_logo
    `)
    .eq("role", "advisor");

  if (error) throw error;

  if (!data) return [];

  const usersWithLogo = data.filter((user) => user.url_logo);

  if (usersWithLogo.length === 0) { return data; }

  const logoKeys = usersWithLogo.map((user) => user.url_logo as string);

  const { data: signedUrls = [], ok } = await fetchSignedUrls(logoKeys);

  if (!ok) return data;

  const signedUrlMap = signedUrls.reduce(
    (acc: Record<string, string>, curr: any) => {
      acc[curr.key] = curr.url;
      return acc;
    },
    {}
  );

  return data.map((user) => ({
    ...user,
    url_logo_signed: user.url_logo
      ? signedUrlMap[user.url_logo] || null
      : null,
  }));
};
type ClientInfo = {
  ip_address: string;
  city: string;
  region: string;
  country: string;
  browser: string;
  device: string;
  language: string;
  user_agent: string;
};
export const createSurveyResponse = async (
  payload: {
    form_id: string;
    advisor_id: string;
    answers: Record<string, any>;
    client_info: ClientInfo;
  }
) => {
  const { data, error } = await supabase
    .from("survey_responses")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};