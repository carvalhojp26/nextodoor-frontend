import React from 'react';
import NotificationList from '../features/notifications/notificationList';
import { Header } from '../components/mainHeader';

const NotificationPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow bg-[#F5F7FA]">
        <div className="container mx-auto px-4 pt-8 pb-8">
          <h1 className="text-2xl text-[#3568ff] font-bold mb-6">Notifications</h1>
          <h1 className="text-1xl text-[#3568ff] font-bold mb-6">Verify task completion</h1>
          <NotificationList />
        </div>
      </main>
    </div>
  );
};

export default NotificationPage;
