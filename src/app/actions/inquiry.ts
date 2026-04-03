'use server'

import { client } from '@/sanity/lib/client'

export async function submitInquiry(formData: FormData) {
  try {
    const rawData = {
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      email: formData.get('email') as string,
      company: formData.get('company') as string,
      contact: formData.get('contact') as string,
      country: formData.get('country') as string,
      message: formData.get('message') as string,
    }

    // Using the client with a token directly to create document in Sanity dataset
    // Next.js Server Actions run on the server so token is not exposed
    
    // Instead of using the default client which might not have write access
    // we use a specific client config here. Wait, actually I configured `lib/client.ts`
    // but the token isn't in it. Let's create a specialized tokened client.
    
    // BUT WAIT, this is simple. I can just create it using the write token from env.
    const writeClient = client.withConfig({
      token: process.env.SANITY_API_TOKEN,
    })

    await writeClient.create({
      _type: 'inquiry',
      ...rawData,
      createdAt: new Date().toISOString(),
    })

    return { success: true }
  } catch (error) {
    console.error('Error submitting inquiry:', error)
    return { success: false, error: 'Failed to submit inquiry. Please try again later.' }
  }
}
