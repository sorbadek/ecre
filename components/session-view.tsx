import { useEffect, useRef, useState } from "react"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { sessionClient } from "@/lib/session-client"

export default function SessionView({ session, onClose }: { session: any; onClose: () => void }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [loading, setLoading] = useState(true)
  const { user, identity } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const joinSession = async () => {
      if (!session?.id) {
        toast({
          title: "Error",
          description: "Invalid session",
          variant: "destructive",
        })
        onClose()
        return
      }

      try {
        // Join the session first
        const updatedSession = await sessionClient.joinSession(session.id)
        
        // Get the meeting URL with authentication
        const meetingUrl = new URL(updatedSession.meetingUrl || session.meetingUrl)
        
        // Add authentication token if available
        if (identity) {
          const authToken = await identity.getPrincipal().toString()
          meetingUrl.searchParams.append('auth', authToken)
        }
        
        // Add user info
        meetingUrl.searchParams.append('userInfo', JSON.stringify({
          displayName: user?.name || 'Anonymous',
          email: user?.email || '',
          avatar: user?.image || ''
        }))
        
        // Skip pre-join screen
        meetingUrl.searchParams.append('config.prejoinPageEnabled', 'false')
        meetingUrl.searchParams.append('interfaceConfig.DISABLE_JOIN_LEAVE_NOTIFICATIONS', 'true')
        
        if (iframeRef.current) {
          iframeRef.current.src = meetingUrl.toString()
          setLoading(false)
        }
      } catch (error) {
        console.error("Failed to join session:", error)
        toast({
          title: "Error",
          description: "Failed to join the session",
          variant: "destructive",
        })
        onClose()
      }
    }

    joinSession()
    
    // Cleanup function
    return () => {
      // Any cleanup if needed
    }
  }, [session, onClose, user, identity])

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="bg-gray-900 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="text-white hover:bg-gray-800"
          >
            ← Back to Sessions
          </Button>
          <h2 className="text-white text-xl font-semibold">{session?.title || 'Session'}</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => iframeRef.current?.contentWindow?.location.reload()}
            className="text-white border-gray-600 hover:bg-gray-800"
          >
            Reconnect
          </Button>
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="text-white hover:bg-gray-800"
          >
            Leave Session
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center bg-gray-900">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-white">Connecting to session...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1">
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            allow="camera; microphone; display-capture"
            allowFullScreen
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      )}
    </div>
  )
}
