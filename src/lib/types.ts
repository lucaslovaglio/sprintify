export type PsaCard = {
    isPSA: boolean;
    source: { filename: string; mimetype: string; size: number };
    card: {
      sport?: string;
      player?: string;
      set?: string;
      subset?: string | null;
      number?: string | number | null;
      grade?: string | null;
      certificationNumber?: string | number | null;
      qualifiers?: string | null;
      team?: string | null;
      fullDescription?: string | null;
    };
};