export interface EmergencyResponse {
  actions: string[];
  donts: string[];
  note: string;
  source?: "cache" | "ai";
}

export interface EmergencyState {
  loading: boolean;
  error: string | null;
  result: EmergencyResponse | null;
}
