@@ .. @@
 import React, { useState, useEffect } from 'react';
 import { useAuth } from './hooks/useAuth';
 import { useCases } from './hooks/useCases';
-import { CaseFilters } from './types';
+import { CaseFilters, Case } from './types';
 import LoginForm from './components/auth/LoginForm';
 import Header from './components/layout/Header';
 import Navigation from './components/layout/Navigation';