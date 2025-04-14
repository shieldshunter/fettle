import { getJB2Token } from './jb2-auth';

const API_BASE  = 'https://api-jb2.integrations.ecimanufacturing.com';

interface BinLocation {
    binLocation: string;
    cost: number;
    datePosted: string;
    deliveryTicketNumber: string;
    lastModDate: string | number | null;
    lastModUser: string;
    lotNumber: string;
    partNumber: string;
    POItemNumber: number;
    quantityOnHand: number;
    receiverNumber: string;
    uniqueID: number;
    vendorCode: string;
}
  
export async function fetchBinLocationsByPart(partNumber: string): Promise<BinLocation[]> {
const token = await getJB2Token();
console.log("Using token:", token);

// Construct the URL for the bin locations endpoint.
const url = new URL("/api/v1/bin-locations", API_BASE);
// Use filter expression for the part number.
url.searchParams.set("partNumber[eq]", partNumber);
// Specify only the desired fields.
url.searchParams.set(
    "fields",
    "binLocation,cost,datePosted,deliveryTicketNumber,lastModDate,lastModUser,lotNumber,partNumber,POItemNumber,quantityOnHand,receiverNumber,uniqueID,vendorCode"
);
// Set paging parameters.
url.searchParams.set("take", "50");
url.searchParams.set("skip", "0");
// Optionally, add a sort expression.
url.searchParams.set("sort", "-lastModDate");

console.log("BinLocations endpoint:", url.toString());

const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` }
});

if (!response.ok) {
    throw new Error(
    `Bin locations fetch failed ${response.status} ${response.statusText}`
    );
}

const json = await response.json();
console.log("Got response:", json);
// Return the Data array (which should be an array of BinLocation objects).
return json.Data;
}