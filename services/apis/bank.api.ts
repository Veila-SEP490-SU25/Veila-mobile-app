export interface Bank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
}

export interface BanksResponse {
  code: string;
  desc: string;
  data: Bank[];
}

export const bankApi = {
  getBanks: async (): Promise<BanksResponse> => {
    const response = await fetch("https://api.vietqr.io/v2/banks");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};
