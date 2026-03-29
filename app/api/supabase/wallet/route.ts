import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's wallet
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (walletError) {
      // Create wallet if doesn't exist
      const { data: newWallet } = await supabase
        .from('wallets')
        .insert([{ user_id: user.id }])
        .select()
        .single();
      return NextResponse.json(newWallet);
    }

    return NextResponse.json(wallet);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, amount, description } = body;

    // Update wallet
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (walletError) throw walletError;

    let newBalance = wallet.balance;
    if (type === 'topup') {
      newBalance += amount;
    } else if (type === 'withdrawal') {
      if (wallet.balance < amount) {
        return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
      }
      newBalance -= amount;
    }

    // Update wallet balance
    const { data: updated, error: updateError } = await supabase
      .from('wallets')
      .update({ balance: newBalance })
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Create transaction record
    await supabase
      .from('transactions')
      .insert([{
        wallet_id: updated.id,
        type,
        amount,
        description,
      }]);

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
