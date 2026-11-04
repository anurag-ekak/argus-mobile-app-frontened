import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AuthProvider} from './src/context/AuthContext';
import {SidebarProvider} from './src/context/SidebarContext';
import {ToastProvider} from './src/context/ToastContext';
import SidebarDrawer from './src/components/SidebarDrawer';
import AppNavigator from './src/navigation/AppNavigator';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SidebarProvider>
          <ToastProvider>
            <AppNavigator />
            <SidebarDrawer />
          </ToastProvider>
        </SidebarProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
