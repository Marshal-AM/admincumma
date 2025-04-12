import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get the path to revalidate from the request
    const path = request.nextUrl.searchParams.get('path') || '/';
    
    // Optional secret token to prevent abuse
    const secret = request.nextUrl.searchParams.get('secret');
    
    // Optional tag to revalidate instead of path
    const tag = request.nextUrl.searchParams.get('tag');
    
    // Check for secret if one is set in env
    if (process.env.REVALIDATION_SECRET && secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { 
          revalidated: false, 
          error: 'Invalid secret token' 
        },
        { status: 401 }
      );
    }
    
    // Set cache control headers
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    
    // Revalidate the given path or tag
    if (tag) {
      revalidateTag(tag);
      return NextResponse.json(
        { 
          revalidated: true, 
          message: `Tag ${tag} revalidated at ${new Date().toISOString()}`,
          timestamp: Date.now() 
        },
        { headers }
      );
    } else {
      revalidatePath(path);
      return NextResponse.json(
        { 
          revalidated: true, 
          message: `Path ${path} revalidated at ${new Date().toISOString()}`,
          timestamp: Date.now() 
        },
        { headers }
      );
    }
  } catch (error) {
    console.error('Error revalidating:', error);
    return NextResponse.json(
      { 
        revalidated: false, 
        error: 'Failed to revalidate',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now() 
      },
      { status: 500 }
    );
  }
} 