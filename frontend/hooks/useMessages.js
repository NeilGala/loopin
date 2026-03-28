"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

export function useMessages(currentAddress) {
  const [conversations,   setConversations]   = useState([]);
  const [isLoadingInbox,  setIsLoadingInbox]  = useState(false);
  const channelRef = useRef(null);

  const me = currentAddress?.toLowerCase();

  // ── Stable conversation key ──────────────────────────────────────
  function conversationId(a, b) {
    const lo = a.toLowerCase();
    const hi = b.toLowerCase();
    return lo < hi ? `${lo}_${hi}` : `${hi}_${lo}`;
  }

  // ── Fetch messages for a conversation ───────────────────────────
  const fetchMessages = useCallback(async (otherAddress) => {
    if (!me || !otherAddress) return [];
    const other = otherAddress.toLowerCase();

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender.eq.${me},recipient.eq.${other}),` +
        `and(sender.eq.${other},recipient.eq.${me})`
      )
      .order("created_at", { ascending: true });

    if (error) { console.error("fetchMessages:", error); return []; }
    return data || [];
  }, [me]);

  // ── Send a message ───────────────────────────────────────────────
  const sendMessage = useCallback(async (recipientAddress, content) => {
    if (!me || !recipientAddress || !content.trim()) {
      return { success: false, error: "Missing fields." };
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender:    me,
        recipient: recipientAddress.toLowerCase(),
        content:   content.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("sendMessage:", error);
      return { success: false, error: error.message };
    }
    return { success: true, message: data };
  }, [me]);

  // ── Subscribe to a conversation's new messages ───────────────────
  const subscribeToConversation = useCallback((otherAddress, onNewMessage) => {
    if (!me || !otherAddress) return () => {};
    const other = otherAddress.toLowerCase();

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`conv:${conversationId(me, other)}:${Date.now()}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `sender=eq.${me},recipient=eq.${other}`,
      }, (payload) => onNewMessage(payload.new))
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `sender=eq.${other},recipient=eq.${me}`,
      }, (payload) => onNewMessage(payload.new))
      .subscribe();

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [me]);

  // ── Load inbox ───────────────────────────────────────────────────
  const loadInbox = useCallback(async () => {
    if (!me) return;
    setIsLoadingInbox(true);

    try {
      const [{ data: sent }, { data: received }] = await Promise.all([
        supabase.from("messages").select("*").eq("sender", me)
          .order("created_at", { ascending: false }),
        supabase.from("messages").select("*").eq("recipient", me)
          .order("created_at", { ascending: false }),
      ]);

      const all = [...(sent || []), ...(received || [])];
      const convMap = new Map();

      for (const msg of all) {
        const otherId = msg.sender === me ? msg.recipient : msg.sender;
        const key     = conversationId(me, otherId);
        if (
          !convMap.has(key) ||
          new Date(msg.created_at) > new Date(convMap.get(key).lastMessage.created_at)
        ) {
          convMap.set(key, { otherId, lastMessage: msg });
        }
      }

      const sorted = [...convMap.values()].sort(
        (a, b) =>
          new Date(b.lastMessage.created_at) -
          new Date(a.lastMessage.created_at)
      );

      setConversations(sorted);
    } catch (err) {
      console.error("loadInbox:", err);
    } finally {
      setIsLoadingInbox(false);
    }
  }, [me]);

  // ── Inbox realtime subscription ──────────────────────────────────
  useEffect(() => {
    if (!me) return;
    loadInbox();

    const channel = supabase
      .channel(`inbox:${me}:${Date.now()}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `recipient=eq.${me}`,
      }, () => loadInbox())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [me, loadInbox]);

  return {
    conversations,
    isLoadingInbox,
    loadInbox,
    fetchMessages,
    sendMessage,
    subscribeToConversation,
    conversationId,
  };
}