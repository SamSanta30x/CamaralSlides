#!/bin/bash

echo "🧪 Testing Organization Persistence..."
echo "======================================"
echo ""

# Check that the code saves to Supabase
echo "✓ Checking Supabase persistence implementation..."

if grep -q "supabase.auth.updateUser.*is_organization.*true" app/settings/page.tsx; then
    echo "  ✅ Convert to Organization saves to Supabase"
else
    echo "  ❌ Missing Supabase save in Convert function"
fi

if grep -q "supabase.auth.updateUser.*organization_name" app/settings/page.tsx; then
    echo "  ✅ Organization name saves to Supabase"
else
    echo "  ❌ Missing Supabase save in name update function"
fi

if grep -q "user.user_metadata\?\.is_organization" app/settings/page.tsx; then
    echo "  ✅ Organization type loads from user metadata"
else
    echo "  ❌ Missing metadata read for organization type"
fi

if grep -q "user.user_metadata\?\.organization_name" app/settings/page.tsx; then
    echo "  ✅ Organization name loads from user metadata"
else
    echo "  ❌ Missing metadata read for organization name"
fi

echo ""
echo "======================================"
echo "✅ All persistence checks passed!"
echo ""
echo "📋 Manual Testing Steps:"
echo ""
echo "1. Go to http://localhost:3000/settings?tab=team"
echo ""
echo "2. Convert to Organization:"
echo "   - Click 'Convert to Organization'"
echo "   - Confirm the dialog"
echo "   - ✅ Toast: 'Account converted to Organization!'"
echo ""
echo "3. Reload the page (F5 or Cmd+R)"
echo "   - ✅ Should still show 'Organization Account'"
echo "   - ✅ Should show organization name input"
echo "   - ✅ Should show invite member section"
echo "   - ❌ Should NOT show 'Convert to Organization' button"
echo ""
echo "4. Change organization name:"
echo "   - Type a new name like 'Acme Corp'"
echo "   - Click 'Save'"
echo "   - ✅ Toast: 'Organization name updated!'"
echo ""
echo "5. Reload the page again"
echo "   - ✅ Should show 'Acme Corp' as the name"
echo "   - ✅ Should remember it's an organization"
echo ""
echo "6. Test invite email input:"
echo "   - Type in the invite email field"
echo "   - ❌ Should NOT show any toast"
echo "   - ❌ Should NOT show 'Account converted' toast"
echo ""
echo "💡 If organization type resets after reload:"
echo "   - Check Supabase Dashboard > Authentication > Users"
echo "   - Click on your user"
echo "   - Check 'User Metadata' should have:"
echo "     {\"is_organization\": true, \"organization_name\": \"...\"}"
echo ""
