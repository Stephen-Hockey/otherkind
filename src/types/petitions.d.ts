type Petition = {
    petitionId: number,
    title: string,
    categoryId: number,
    ownerId: number,
    ownerFirstName: string,
    ownerLastName: string,
    numberOfSupporters: number,
    creationDate: string,
    supportingCost: number,
}

type PetitionSearchParams = {
    startIndex?: number,
    count?: number,
    q?: string,
    categoryIds?: number[],
    supportingCost?: number,
    ownerId?: number,
    supporterId?: number,
    sortBy?: string
}

type Category = {
    categoryId: number,
    name: string
}

type PetitionDetails = {
    petitionId: number,
    title: string,
    categoryId: number,
    ownerId: number,
    ownerFirstName: string,
    ownerLastName: string,
    numberOfSupporters: number,
    creationDate: string,
    description: string,
    moneyRaised: number,
    supportTiers: SupportTier[]
}

type Supporter = {
    supportId: number,
    supportTierId: number,
    message: string | null,
    supporterId: number,
    supporterFirstName: string,
    supporterLastName: string,
    timestamp: string
}

type SupportTier = {
    supportTierId: number
    title: string, // max 128
    description: string, // max 1024
    cost: number // min 0 and format integer
}

type SupportTierCreate = {
    index: number, // 0 1 or 2
    title: string,
    description: string,
    cost: string,
    supportTierId?: number,
    hasSupport: boolean
}

type Support = {
    supportTierId: number,
    message?: string
}

type User = {
    email: string,
    firstName: string,
    lastName: string
}

type EditUserBody = {
    email?: string,
    firstName?: string,
    lastName?: string,
    password?: string,
    currentPassword?: string,
}

