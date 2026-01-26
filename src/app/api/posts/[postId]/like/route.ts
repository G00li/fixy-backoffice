import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

interface RouteContext {
  params: Promise<{ postId: string }>;
}

// POST - Like post
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { postId } = await context.params;
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('*')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .single();

    if (existingLike) {
      return NextResponse.json(
        { error: 'Already liked' },
        { status: 400 }
      );
    }

    // Create like (trigger will update counter)
    const { error: likeError } = await supabase
      .from('post_likes')
      .insert({
        user_id: user.id,
        post_id: postId,
      });

    if (likeError) {
      console.error('Error liking post:', likeError);
      throw likeError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Like API error:', error);
    return NextResponse.json(
      { error: 'Failed to like post' },
      { status: 500 }
    );
  }
}

// DELETE - Unlike post
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { postId } = await context.params;
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Delete like (trigger will update counter)
    const { error: unlikeError } = await supabase
      .from('post_likes')
      .delete()
      .eq('user_id', user.id)
      .eq('post_id', postId);

    if (unlikeError) {
      console.error('Error unliking post:', unlikeError);
      throw unlikeError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unlike API error:', error);
    return NextResponse.json(
      { error: 'Failed to unlike post' },
      { status: 500 }
    );
  }
}
