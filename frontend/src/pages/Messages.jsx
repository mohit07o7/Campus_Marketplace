import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  MessageCircle,
  Send,
  ArrowLeft,
  Search,
  ShieldCheck,
  CheckCheck,
  Clock,
  Inbox,
  User
} from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Messages.css'

export default function Messages() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  // Conversations State
  const [conversations, setConversations] = useState([])
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [searchFilter, setSearchFilter] = useState('')

  // Active Chat State
  const [activePartner, setActivePartner] = useState(null)
  const [activeListingId, setActiveListingId] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [inputContent, setInputContent] = useState('')
  const [sending, setSending] = useState(false)

  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await api.get('/messages/conversations')
      setConversations(data || [])
      return data || []
    } catch (err) {
      console.error('Failed to load conversations:', err)
      return []
    } finally {
      setLoadingConversations(false)
    }
  }, [])

  // Load message thread for a specific partner
  const selectPartner = useCallback(
    async (partner, listingId = null) => {
      // Guard: partner must have a valid _id
      if (!partner?._id || partner._id === 'undefined') {
        console.warn('selectPartner called with invalid partner:', partner)
        return
      }
      setActivePartner(partner)
      if (listingId) setActiveListingId(listingId)
      setLoadingMessages(true)

      try {
        const { data } = await api.get(`/messages/${partner._id}`)
        setMessages(data || [])
        // Refresh conversation list to mark read status in list
        fetchConversations()
      } catch (err) {
        console.error('Failed to load message thread:', err)
      } finally {
        setLoadingMessages(false)
      }
    },
    [fetchConversations]
  )

  // Initial load & URL params handler
  useEffect(() => {
    let isMounted = true

    async function init() {
      const convs = await fetchConversations()
      if (!isMounted) return

      const sellerParam = searchParams.get('sellerId') || searchParams.get('userId')
      const listingParam = searchParams.get('listingId')

      if (sellerParam) {
        // Find existing conversation with this user
        // NOTE: $lookup returns arrays, so sender/receiver are [{_id, name}]
        const existing = convs.find((c) => {
          const sender = Array.isArray(c.sender) ? c.sender[0] : c.sender
          const receiver = Array.isArray(c.receiver) ? c.receiver[0] : c.receiver
          return sender?._id?.toString() === sellerParam || receiver?._id?.toString() === sellerParam
        })

        if (existing) {
          const sender = Array.isArray(existing.sender) ? existing.sender[0] : existing.sender
          const receiver = Array.isArray(existing.receiver) ? existing.receiver[0] : existing.receiver
          const partner = sender?._id?.toString() === user?._id ? receiver : sender
          selectPartner(partner, listingParam || existing.listingId)
        } else {
          // New conversation partner not in conversations list yet
          setActivePartner({ _id: sellerParam, name: 'Campus Seller' })
          setActiveListingId(listingParam)
          setMessages([])
        }
      } else if (convs.length > 0 && window.innerWidth > 820) {
        // Auto-select first conversation on desktop
        const first = convs[0]
        const sender = Array.isArray(first.sender) ? first.sender[0] : first.sender
        const receiver = Array.isArray(first.receiver) ? first.receiver[0] : first.receiver
        const partner = sender?._id?.toString() === user?._id ? receiver : sender
        selectPartner(partner, first.listingId)
      }
    }

    init()

    return () => {
      isMounted = false
    }
  }, [fetchConversations, searchParams, selectPartner, user?._id])

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputContent.trim() || !activePartner) return

    const contentToSend = inputContent.trim()
    setInputContent('')
    setSending(true)

    try {
      const payload = {
        receiverId: activePartner._id,
        content: contentToSend
      }
      if (activeListingId) payload.listingId = activeListingId

      const { data: newMsg } = await api.post('/messages', payload)
      setMessages((prev) => [...prev, newMsg])

      // Refresh conversations list
      fetchConversations()
    } catch (err) {
      console.error('Failed to send message:', err)
      // Restore input text on failure
      setInputContent(contentToSend)
    } finally {
      setSending(false)
    }
  }

  // Filter conversations by contact name
  const filteredConversations = conversations.filter((c) => {
    const sender = Array.isArray(c.sender) ? c.sender[0] : c.sender
    const receiver = Array.isArray(c.receiver) ? c.receiver[0] : c.receiver
    const partner = sender?._id?.toString() === user?._id ? receiver : sender
    const name = partner?.name || ''
    return name.toLowerCase().includes(searchFilter.toLowerCase())
  })

  return (
    <div className="messages-page-container page-enter">
      <div className="messages-card">
        {/* ── Left Panel: Conversations List ─────────────────── */}
        <div
          className="conversations-panel"
          style={{
            display: activePartner && window.innerWidth <= 820 ? 'none' : 'flex'
          }}
        >
          <div className="conversations-header">
            <h2>
              <MessageCircle size={20} color="var(--primary-500)" /> Chats
            </h2>
            {conversations.length > 0 && (
              <span className="conversations-count">
                {conversations.length}
              </span>
            )}
          </div>

          {/* Search bar */}
          <div className="conversations-search-wrap">
            <Search size={15} className="conv-search-icon" />
            <input
              type="text"
              className="conv-search-input"
              placeholder="Search conversations..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>

          {/* List items */}
          <div className="conversations-list">
            {loadingConversations ? (
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton-box" style={{ width: '100%', height: 60, borderRadius: 'var(--radius-md)' }} />
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="conversations-empty">
                <Inbox size={40} color="var(--text-dim)" />
                <p>No conversations found.</p>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const sender = Array.isArray(c.sender) ? c.sender[0] : c.sender
                const receiver = Array.isArray(c.receiver) ? c.receiver[0] : c.receiver
                const partner = sender?._id?.toString() === user?._id ? receiver : sender
                const partnerName = partner?.name || 'Fellow Student'
                const partnerInitial = partnerName[0]?.toUpperCase() || 'S'
                const isActive = activePartner?._id === partner?._id?.toString()
                const isUnread = !c.isRead && receiver?._id?.toString() === user?._id

                return (
                  <button
                    key={c._id}
                    className={`conversation-item ${isActive ? 'active' : ''}`}
                    onClick={() => selectPartner(partner, c.listingId)}
                  >
                    <div className="conv-avatar">{partnerInitial}</div>
                    <div className="conv-details">
                      <div className="conv-top-row">
                        <span className="conv-name">{partnerName}</span>
                        <span className="conv-time">{getTimeAgo(c.createdAt)}</span>
                      </div>
                      <div className="conv-preview">{c.content}</div>
                    </div>
                    {isUnread && <div className="conv-unread-dot" />}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* ── Right Panel: Chat Thread ───────────────────────── */}
        {activePartner ? (
          <div className="chat-panel">
            {/* Header */}
            <div className="chat-header">
              <div className="chat-partner-info">
                <button
                  className="back-to-convs-btn"
                  onClick={() => setActivePartner(null)}
                  aria-label="Back to conversations"
                >
                  <ArrowLeft size={18} />
                </button>

                <div className="conv-avatar" style={{ width: 38, height: 38, fontSize: '0.85rem' }}>
                  {(activePartner.name || 'S')[0].toUpperCase()}
                </div>

                <div>
                  <div className="chat-partner-name">{activePartner.name}</div>
                  <span className="chat-badge">
                    <ShieldCheck size={12} /> Verified Student
                  </span>
                </div>
              </div>

              {activeListingId && (
                <Link
                  to={`/listing/${activeListingId}`}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '0.78rem' }}
                >
                  View Related Item
                </Link>
              )}
            </div>

            {/* Messages Stream */}
            <div className="chat-messages-stream">
              {loadingMessages ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
                  <div className="skeleton-box" style={{ width: '45%', height: 42, alignSelf: 'flex-start' }} />
                  <div className="skeleton-box" style={{ width: '55%', height: 42, alignSelf: 'flex-end' }} />
                  <div className="skeleton-box" style={{ width: '40%', height: 42, alignSelf: 'flex-start' }} />
                </div>
              ) : messages.length === 0 ? (
                <div className="no-chat-selected" style={{ padding: '3rem' }}>
                  <div className="no-chat-icon">
                    <MessageCircle size={32} />
                  </div>
                  <h3>Start Conversation</h3>
                  <p>
                    Send a message to ask about condition, pricing, or arrange a campus meetup.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const senderIdStr = msg.senderId?._id || msg.senderId
                  const isMine = user && senderIdStr === user._id

                  return (
                    <div
                      key={msg._id}
                      className={`message-row ${isMine ? 'sent' : 'received'}`}
                    >
                      <div className="message-bubble">{msg.content}</div>
                      <div className="message-meta">
                        <span>{formatMessageTime(msg.createdAt)}</span>
                        {isMine && (
                          <CheckCheck
                            size={13}
                            color={msg.isRead ? 'var(--primary-200)' : 'var(--text-dim)'}
                          />
                        )}
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Bar */}
            <form className="chat-input-bar" onSubmit={handleSendMessage}>
              <input
                type="text"
                className="chat-input"
                placeholder={`Message ${activePartner.name}...`}
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                disabled={sending}
              />
              <button
                type="submit"
                className="chat-send-btn"
                disabled={sending || !inputContent.trim()}
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        ) : (
          <div className="chat-panel no-chat-selected">
            <div className="no-chat-icon">
              <MessageCircle size={36} />
            </div>
            <h3>Your Messages</h3>
            <p>
              Select a conversation from the left to read messages or negotiate item offers with fellow students.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function getTimeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d`
  if (hours > 0) return `${hours}h`
  if (mins > 0) return `${mins}m`
  return 'now'
}

function formatMessageTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
