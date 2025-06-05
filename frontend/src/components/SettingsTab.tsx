
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SettingsTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
        <CardDescription>
          Configure booking system parameters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Max Daily Hours</label>
            <input
              type="number"
              defaultValue="2"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Max Weekly Hours</label>
            <input
              type="number"
              defaultValue="6"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Mandatory Gap (minutes)</label>
            <input
              type="number"
              defaultValue="15"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Advance Booking Days</label>
            <input
              type="number"
              defaultValue="7"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
        
        <Button>Save Settings</Button>
      </CardContent>
    </Card>
  );
};

export default SettingsTab;
