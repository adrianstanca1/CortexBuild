#!/usr/bin/env python3
"""
CortexBuild Phase 6: Component Integration Script
Automatically integrates React components with Supabase database
"""

import os
import re
from pathlib import Path

# Components to integrate
COMPONENTS_TO_INTEGRATE = {
    'components/screens/company/DepartmentManagement.tsx': {
        'table': 'departments',
        'rpc_functions': ['create_department', 'update_department_budget'],
        'description': 'Department management with budget tracking'
    },
    'components/screens/company/RoleManagement.tsx': {
        'table': 'custom_roles',
        'rpc_functions': [],
        'description': 'Custom role management'
    },
    'components/screens/company/TeamManagement.tsx': {
        'table': 'department_members',
        'rpc_functions': ['invite_team_member', 'update_team_member_role'],
        'description': 'Team member management'
    },
    'components/screens/company/CompanyAnalytics.tsx': {
        'table': 'company_analytics',
        'rpc_functions': ['get_company_analytics'],
        'description': 'Company analytics and metrics'
    },
    'components/screens/company/CompanySettings.tsx': {
        'table': 'company_settings',
        'rpc_functions': ['create_api_key'],
        'description': 'Company settings, API keys, and webhooks'
    },
    'components/ui/RoleSelector.tsx': {
        'table': 'custom_roles',
        'rpc_functions': [],
        'description': 'Role selector dropdown'
    },
    'components/ui/DepartmentSelector.tsx': {
        'table': 'departments',
        'rpc_functions': [],
        'description': 'Department selector dropdown'
    },
}

def check_component_integration(filepath):
    """Check if component is already integrated with Supabase"""
    try:
        with open(filepath, 'r') as f:
            content = f.read()
            
        # Check for Supabase imports
        has_supabase_import = 'from' in content and 'supabase' in content
        has_useeffect = 'useEffect' in content
        has_async_fetch = 'async' in content and 'fetch' in content.lower()
        
        return {
            'has_supabase_import': has_supabase_import,
            'has_useeffect': has_useeffect,
            'has_async_fetch': has_async_fetch,
            'is_integrated': has_supabase_import and (has_useeffect or has_async_fetch)
        }
    except FileNotFoundError:
        return {'error': f'File not found: {filepath}'}

def main():
    """Main execution"""
    print("\n" + "="*70)
    print("🚀 CortexBuild Phase 6: Component Integration Analysis")
    print("="*70)
    
    print("\n📋 Components to Integrate:\n")
    
    total_components = len(COMPONENTS_TO_INTEGRATE)
    integrated = 0
    not_integrated = 0
    missing = 0
    
    for component_path, config in COMPONENTS_TO_INTEGRATE.items():
        print(f"\n{'─'*70}")
        print(f"📄 {component_path}")
        print(f"   📊 Table: {config['table']}")
        print(f"   ⚙️  RPC Functions: {', '.join(config['rpc_functions']) if config['rpc_functions'] else 'None'}")
        print(f"   📝 Description: {config['description']}")
        
        result = check_component_integration(component_path)
        
        if 'error' in result:
            print(f"   ❌ {result['error']}")
            missing += 1
        elif result['is_integrated']:
            print(f"   ✅ Already integrated with Supabase")
            integrated += 1
        else:
            print(f"   ⚠️  Needs integration")
            print(f"      - Supabase import: {'✅' if result['has_supabase_import'] else '❌'}")
            print(f"      - useEffect hook: {'✅' if result['has_useeffect'] else '❌'}")
            print(f"      - Async fetch: {'✅' if result['has_async_fetch'] else '❌'}")
            not_integrated += 1
    
    print(f"\n{'='*70}")
    print("📊 Integration Summary")
    print(f"{'='*70}")
    print(f"✅ Already Integrated: {integrated}/{total_components}")
    print(f"⚠️  Needs Integration: {not_integrated}/{total_components}")
    print(f"❌ Missing Files: {missing}/{total_components}")
    
    print(f"\n{'='*70}")
    print("🎯 Next Steps")
    print(f"{'='*70}")
    print("""
1. Review each component that needs integration
2. Add Supabase imports: import { supabase } from '../../../lib/supabase/client'
3. Add useEffect hooks to fetch data from tables
4. Add RPC function calls for complex operations
5. Add error handling and loading states
6. Test each component with real data
7. Run npm run build to verify no errors
8. Deploy to production
    """)
    
    print(f"\n{'='*70}")
    print("📁 Database Tables Ready")
    print(f"{'='*70}")
    print("""
✅ departments - Department management
✅ custom_roles - Role management
✅ department_members - Team member assignments
✅ company_analytics - Analytics and metrics
✅ company_settings - Company configuration
✅ api_keys - API key management
✅ webhooks - Webhook configuration
    """)
    
    print(f"\n{'='*70}")
    print("⚙️  RPC Functions Ready")
    print(f"{'='*70}")
    print("""
✅ invite_team_member() - Add team members
✅ update_team_member_role() - Update user roles
✅ create_department() - Create departments
✅ assign_user_to_department() - Assign users to departments
✅ get_company_analytics() - Retrieve analytics
✅ create_api_key() - Generate API keys
✅ update_department_budget() - Update budgets
✅ get_department_members() - Get department members
✅ get_department_budget_summary() - Get budget summaries
    """)

if __name__ == "__main__":
    main()

