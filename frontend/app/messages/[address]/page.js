"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useUserRegistry } from "@/hooks/useUserRegistry";
import { useMessages } from "@/hooks/useMessages";
import MessageBubble from "@/components/MessageBubble";
import { shortAddress } from "@/lib/constants";

const MAX_MESSAGE_LENGTH = 1000;

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const otherAddress = params.address?.toLowerCase();

  const { address, isConnected, isInitialized } = useWallet();
  const { getUsername } = useUserRegistry();
  const { fetchMessages, sendMessage, subscribeToConversation } = useMessages(address);

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [otherUsername, setOtherUsername] = useState(null);
  const [myUsername, setMyUsername] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const me = address?.toLowerCase();

  // Auth guard
  useEffect(() => {
    if (!isInitialized) return;
    if (!isConnected) {
      router.push("/");
      return;
    }

    async function init() {
      const [myName, otherName] = await Promise.all([
        getUsername(address),
        getUsername(otherAddress),
      ]);

      if (!myName) {
        router.push("/onboarding");
        return;
      }

      setMyUsername(myName);
      setOtherUsername(otherName || null);
      setAuthReady(true);
    }

    init();
  }, [isInitialized, isConnected, address, otherAddress, getUsername, router]);

  // Load messages
  useEffect(() => {
    if (!authReady || !otherAddress) return;

    async function load() {
      setLoading(true);
      const msgs = await fetchMessages(otherAddress);
      setMessages(msgs);
      setLoading(false);
    }

    load();
  }, [authReady, otherAddress, fetchMessages]);

  // Realtime
  useEffect(() => {
    if (!authReady || !otherAddress) return;

    const onNewMessage = (newMsg) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    };

    const unsubscribe = subscribeToConversation(otherAddress, onNewMessage);
    return unsubscribe;
  }, [authReady, otherAddress, subscribeToConversation]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSend = useCallback(async () => {
    const content = inputValue.trim();
    if (!content || isSending) return;

    setSendError(null);
    setIsSending(true);
    setInputValue("");

    const result = await sendMessage(otherAddress, content);

    if (!result.success) {
      setSendError(result.error || "Failed to send. Please try again.");
      setInputValue(content);
    }

    setIsSending(false);
    inputRef.current?.focus();
  }, [inputValue, isSending, otherAddress, sendMessage]);

  // Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isInitialized || !authReady) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="h-screen bg-gray-950 flex flex-col">

      {/* Top bar */}
      <div className="flex-shrink-0 bg-gray-950/90 backdrop-blur-sm border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push("/messages")}
          className="text-gray-400 hover:text-white transition-colors p-1 text-sm"
        >
          ←
        </button>

        {/* User */}
        <button
          onClick={() => router.push(`/profile/${otherAddress}`)}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity flex-1 min-w-0"
        >
          <div
            style={{
              width: 36,
              height: 36,
              flexShrink: 0,
              background: `linear-gradient(135deg, #${otherAddress?.slice(-6)}, #${otherAddress?.slice(2, 8)})`,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 14, color: "white", fontWeight: 800 }}>
              {otherAddress?.slice(2, 3).toUpperCase()}
            </span>
          </div>

          <div className="flex flex-col items-start min-w-0">
            <span className="text-sm font-bold text-white truncate">
              {otherUsername ? `@${otherUsername}` : shortAddress(otherAddress)}
            </span>
            <span className="text-xs text-gray-600 font-mono truncate">
              {shortAddress(otherAddress)}
            </span>
          </div>
        </button>

        {/* FIXED: Added <a> */}
        <a
          href={`https://sepolia.etherscan.io/address/${otherAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-700 hover:text-brand-400 transition-colors flex-shrink-0"
        >
          ⛓️
        </a>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-16 text-center">
            <span className="text-5xl opacity-30">💬</span>
            <p className="text-gray-400 font-medium">No messages yet</p>
            <p className="text-gray-600 text-sm">
              Send a message to start the conversation.
            </p>
          </div>
        )}

        {!loading && messages.length > 0 && (
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-gray-700 text-center mb-4">
              {new Date(messages[0].created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>

            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.sender === me}
              />
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-gray-800 bg-gray-950 px-4 py-3">
        {sendError && (
          <p className="text-red-400 text-xs mb-2">{sendError}</p>
        )}

        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) =>
              setInputValue(e.target.value.slice(0, MAX_MESSAGE_LENGTH))
            }
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            rows={1}
            disabled={isSending}
            className="input flex-1 resize-none py-2.5 leading-relaxed max-h-32 overflow-y-auto"
            style={{ minHeight: "44px" }}
          />

          {inputValue.length > 800 && (
            <span
              className={`text-xs flex-shrink-0 mb-2 ${
                inputValue.length >= MAX_MESSAGE_LENGTH
                  ? "text-red-400"
                  : "text-gray-600"
              }`}
            >
              {MAX_MESSAGE_LENGTH - inputValue.length}
            </span>
          )}

          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-lg flex items-center justify-center transition-all active:scale-95 mb-0.5"
          >
            {isSending ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "↑"
            )}
          </button>
        </div>

        <p className="text-xs text-gray-700 mt-2 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </main>
  );
}