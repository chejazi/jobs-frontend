import { Address } from 'viem';
export interface Trade {
  id: number;
  user: string;
  token: string;
  action: string;
  domain: string;
  tokens: number;
  supply: number;
  cost: string;
  fees: string;
  time: number;
  txid: string;
  name?: string;
  favicon?: string;
  description?: string;
}

export interface Site {
  domain: string;
  token: string;
  favicon: string;
  description: string;
  supply: number;
  holders: number;
  first_traded: number;
}

export interface Position {
  domain: string;
  tokens: number
}

export interface DropdownOption {
  value: string;
  label: string;
  symbol: string;
  rewardPeriods: Array<number>;
}

export interface DropdownOptionLabel {
  value: string;
  label: string;
  image: string;
  description: string | null;
}

export interface NumberMap {
  [key: string]: number;
}

export interface StringMap {
  [key: string]: string;
}

export interface StringNumberMap {
  [key: string]: number;
}

export interface StringBigIntMap {
  [key: string]: bigint;
}

export interface Token {
  name: string;
  symbol: string;
  decimals: number;
  image: string;
  price: number;
  appStake: bigint;
  userStake: bigint;
}

export interface TokenMap {
  [key: string]: Token;
}

export interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  supply: bigint;
  image: string | null;
}

export interface TokenMetadataMap {
  [key: string]: TokenMetadata;
}

export interface Listing {
  title: string;
  description: string;
  manager: Address;
  token: Address;
  quantity: bigint;
  duration: number;
  createTime: number;
  status: number;
}

export type RawListingArray = [string[],string[],Address[],Address[],bigint[],number[],number[],number[]];

export type RawListing = [string,string,Address,Address,bigint,number,number,number];

export interface PassportSocial {
  source: string;
  profile_name: string;
  profile_bio: string;
  profile_image_url: string;
  profile_url: string;
  follower_count: number;
  following_count: number;
  passport_id: number;
}

export interface PassportUserResponse {
  passport: {
    score: number;
    passport_id: number;
    passport_socials: PassportSocial[];
  }
}

export interface NeynarUser {
  username: string;
  follower_count: number;
  verified_addresses: {
    eth_addresses: string[];
  }
}

export interface NeynarUserResponse {
  [key: string]: NeynarUser[];
}

export interface FCUser {
  username: string;
  numFollowers: number;
  pfpUrl: string;
  fallbackBio: string;
  builderScore: number;
  passportId: number;
}

export interface StringFCUserMap {
  [key: string]: FCUser;
}
