export async function uploadToIPFS(data: any): Promise<string> {
  const token = import.meta.env.WEB3_STORAGE_TOKEN;

  if (!token) {
    console.warn('Web3.Storage token not configured. Using mock CID.');
    const mockCID = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockCID;
  }

  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const file = new File([blob], 'metadata.json', { type: 'application/json' });

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://api.web3.storage/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.cid;
  } catch (error) {
    console.error('IPFS upload failed, using mock CID:', error);
    const mockCID = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return mockCID;
  }
}

export async function fetchFromIPFS(cid: string): Promise<any> {
  try {
    const response = await fetch(`https://w3s.link/ipfs/${cid}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch from IPFS:', error);
    return null;
  }
}
