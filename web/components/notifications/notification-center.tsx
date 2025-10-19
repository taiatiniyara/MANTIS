"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  BellOff, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  XCircle,
  ExternalLink,
  Trash2,
  Check
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  category?: string;
  priority: string;
  is_read: boolean;
  read_at?: string;
  action_url?: string;
  action_label?: string;
  created_at: string;
  metadata?: any;
}

interface NotificationCenterProps {
  notifications: Notification[];
  userId: string;
}

export function NotificationCenter({ notifications, userId }: NotificationCenterProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [notificationList, setNotificationList] = useState(notifications);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        setNotificationList((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      });

      if (response.ok) {
        setNotificationList((prev) =>
          prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
        );
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotificationList((prev) => prev.filter((n) => n.id !== notificationId));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, any> = {
      urgent: { variant: "destructive", label: "Urgent" },
      high: { variant: "default", label: "High" },
      normal: { variant: "secondary", label: "Normal" },
      low: { variant: "outline", label: "Low" },
    };
    return variants[priority] || variants.normal;
  };

  const filterNotifications = (tab: string) => {
    switch (tab) {
      case "unread":
        return notificationList.filter((n) => !n.is_read);
      case "read":
        return notificationList.filter((n) => n.is_read);
      case "info":
        return notificationList.filter((n) => n.type === "info");
      case "warning":
        return notificationList.filter((n) => n.type === "warning");
      case "success":
        return notificationList.filter((n) => n.type === "success");
      case "error":
        return notificationList.filter((n) => n.type === "error");
      default:
        return notificationList;
    }
  };

  const filteredNotifications = filterNotifications(activeTab);
  const unreadCount = notificationList.filter((n) => !n.is_read).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Center
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                <Check className="h-4 w-4 mr-2" />
                Mark All as Read
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="all">
              All ({notificationList.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="read">
              Read ({notificationList.length - unreadCount})
            </TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="success">Success</TabsTrigger>
            <TabsTrigger value="warning">Warning</TabsTrigger>
            <TabsTrigger value="error">Error</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredNotifications.length > 0 ? (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      !notification.is_read
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{getTypeIcon(notification.type)}</div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-base">
                                {notification.title}
                              </h3>
                              {!notification.is_read && (
                                <div className="h-2 w-2 rounded-full bg-blue-600" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={getPriorityBadge(notification.priority).variant}
                            >
                              {getPriorityBadge(notification.priority).label}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                              })}
                            </span>
                            {notification.category && (
                              <>
                                <span>•</span>
                                <Badge variant="outline" className="capitalize">
                                  {notification.category}
                                </Badge>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {notification.action_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.href = notification.action_url!}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                {notification.action_label || "View"}
                              </Button>
                            )}
                            
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(notification.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BellOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
