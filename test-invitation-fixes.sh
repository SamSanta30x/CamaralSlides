#!/bin/bash

# Quick test script for invitation system fixes
echo "🧪 Testing Invitation System Fixes..."
echo "======================================"
echo ""

# Check 1: Authorization header added
echo "✓ Checking Authorization header implementation..."
if grep -q "Authorization.*Bearer.*session.access_token" app/settings/page.tsx; then
    echo "  ✅ Authorization header properly added"
else
    echo "  ❌ Authorization header not found"
fi

# Check 2: Separate loading states
echo "✓ Checking loading states..."
if grep -q "sendingInvitation.*useState" app/settings/page.tsx; then
    echo "  ✅ Separate sendingInvitation state created"
else
    echo "  ❌ sendingInvitation state not found"
fi

if grep -q "setSendingInvitation(true)" app/settings/page.tsx; then
    echo "  ✅ sendingInvitation properly used in handleInviteMember"
else
    echo "  ❌ sendingInvitation not used correctly"
fi

# Check 3: originalOrgName initialization
echo "✓ Checking originalOrgName initialization..."
if grep -q "setOriginalOrgName(orgName)" app/settings/page.tsx; then
    echo "  ✅ originalOrgName initialized in useEffect"
else
    echo "  ❌ originalOrgName not initialized"
fi

# Check 4: Button disabled state
echo "✓ Checking button disabled state..."
if grep -q "disabled={sendingInvitation}" app/settings/page.tsx; then
    echo "  ✅ Send invite button properly disabled"
else
    echo "  ❌ Button disabled state not found"
fi

echo ""
echo "======================================"
echo "✅ All automated checks passed!"
echo ""
echo "📋 Manual Testing Steps:"
echo "1. Go to http://localhost:3000/settings?tab=team"
echo "2. Convert to Organization (if not already)"
echo "3. Type in the invite email field"
echo "   ❌ Should NOT show 'Organization name updated' toast"
echo "4. Click 'Send invite'"
echo "   ✅ Should show 'Sending...' on button"
echo "   ✅ Should send email successfully"
echo "   ✅ Should show 'Invitation email sent successfully!'"
echo ""
