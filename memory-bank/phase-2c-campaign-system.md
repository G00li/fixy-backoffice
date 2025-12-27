# Phase 2C - Campaign & Promotion System

**Status:** ⏳ Planned  
**Priority:** Medium

## Overview

Comprehensive campaign and promotion management system with approval workflows, targeting options, and automated notification delivery.

## Objectives

1. Create campaign management database schema
2. Implement campaign creation workflow
3. Build approval system for super_admins
4. Create targeting and segmentation system
5. Implement campaign notification delivery
6. Build campaign analytics and tracking

## Campaign Types

### 1. Global Campaigns

**Characteristics:**
- Target: All users (providers and/or clients)
- Approval: Required by super_admin
- Created by: Super_admin only
- Examples: Platform-wide sales, seasonal promotions, new feature announcements

### 2. Segmented Campaigns

**Characteristics:**
- Target: Specific user segment (all providers OR all clients)
- Approval: Required by super_admin
- Created by: Super_admin or admin
- Examples: Provider-only promotions, client loyalty programs

### 3. Individual Campaigns

**Characteristics:**
- Target: Specific users (selected manually)
- Approval: Not required
- Created by: Admin or super_admin
- Examples: Personalized offers, retention campaigns, VIP rewards

## Permission Matrix

| Role        | Can Create                    | Requires Approval | Can Approve |
|-------------|-------------------------------|-------------------|-------------|
| super_admin | All types                     | No (self-approve) | Yes         |
| admin       | Segmented, Individual         | Yes (for global)  | No          |
| support     | -                             | -                 | No          |
| provider    | -                             | -                 | No          |
| client      | -                             | -                 | No          |

## Database Schema

### Table: `campaigns`

```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('global', 'segmented', 'individual')),
  target_audience TEXT NOT NULL CHECK (target_audience IN ('all', 'providers', 'clients', 'specific')),
  target_user_ids UUID[], -- For individual campaigns
  
  -- Discount/Offer Details
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_service')),
  discount_value NUMERIC,
  discount_code TEXT UNIQUE,
  max_uses INTEGER,
  max_uses_per_user INTEGER DEFAULT 1,
  
  -- Scheduling
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'active', 'paused', 'expired', 'cancelled')),
  
  -- Media
  banner_url TEXT,
  thumbnail_url TEXT,
  
  -- Approval
  created_by UUID NOT NULL REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_campaign_type ON campaigns(campaign_type);
CREATE INDEX idx_campaigns_target_audience ON campaigns(target_audience);
CREATE INDEX idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX idx_campaigns_start_date ON campaigns(start_date);
CREATE INDEX idx_campaigns_end_date ON campaigns(end_date);
CREATE INDEX idx_campaigns_discount_code ON campaigns(discount_code) WHERE discount_code IS NOT NULL;

-- RLS Policies
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all campaigns
CREATE POLICY "Super admins can manage all campaigns"
  ON campaigns
  FOR ALL
  USING (is_super_admin());

-- Admins can view all and manage their own
CREATE POLICY "Admins can view all campaigns"
  ON campaigns
  FOR SELECT
  USING (is_admin_or_above());

CREATE POLICY "Admins can create campaigns"
  ON campaigns
  FOR INSERT
  WITH CHECK (
    is_admin_or_above() AND
    created_by = auth.uid()
  );

CREATE POLICY "Admins can update own campaigns"
  ON campaigns
  FOR UPDATE
  USING (
    is_admin_or_above() AND
    created_by = auth.uid() AND
    status IN ('draft', 'pending_approval')
  );

-- Users can view active campaigns targeted to them
CREATE POLICY "Users can view active campaigns"
  ON campaigns
  FOR SELECT
  USING (
    status = 'active' AND
    (
      target_audience = 'all' OR
      (target_audience = 'providers' AND is_provider()) OR
      (target_audience = 'clients' AND is_client()) OR
      (target_audience = 'specific' AND auth.uid() = ANY(target_user_ids))
    )
  );
```

### Table: `campaign_notifications`

```sql
CREATE TABLE campaign_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ, -- User used the campaign
  UNIQUE(campaign_id, user_id)
);

-- Indexes
CREATE INDEX idx_campaign_notifications_campaign_id ON campaign_notifications(campaign_id);
CREATE INDEX idx_campaign_notifications_user_id ON campaign_notifications(user_id);
CREATE INDEX idx_campaign_notifications_sent_at ON campaign_notifications(sent_at);

-- RLS Policies
ALTER TABLE campaign_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own campaign notifications"
  ON campaign_notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all campaign notifications"
  ON campaign_notifications
  FOR SELECT
  USING (is_admin_or_above());
```

### Table: `campaign_usage`

```sql
CREATE TABLE campaign_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  discount_applied NUMERIC NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_campaign_usage_campaign_id ON campaign_usage(campaign_id);
CREATE INDEX idx_campaign_usage_user_id ON campaign_usage(user_id);
CREATE INDEX idx_campaign_usage_used_at ON campaign_usage(used_at);

-- RLS Policies
ALTER TABLE campaign_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own campaign usage"
  ON campaign_usage
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all campaign usage"
  ON campaign_usage
  FOR SELECT
  USING (is_admin_or_above());
```

### Table: `campaign_analytics`

```sql
CREATE TABLE campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Metrics
  notifications_sent INTEGER DEFAULT 0,
  notifications_read INTEGER DEFAULT 0,
  notifications_clicked INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  total_discount_given NUMERIC DEFAULT 0,
  revenue_generated NUMERIC DEFAULT 0,
  
  -- Calculated at end of day
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, date)
);

-- Indexes
CREATE INDEX idx_campaign_analytics_campaign_id ON campaign_analytics(campaign_id);
CREATE INDEX idx_campaign_analytics_date ON campaign_analytics(date);

-- RLS Policies
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view campaign analytics"
  ON campaign_analytics
  FOR SELECT
  USING (is_admin_or_above());
```

## Database Functions

### `create_campaign()`

```sql
CREATE OR REPLACE FUNCTION create_campaign(
  p_title TEXT,
  p_description TEXT,
  p_campaign_type TEXT,
  p_target_audience TEXT,
  p_target_user_ids UUID[] DEFAULT NULL,
  p_discount_type TEXT DEFAULT NULL,
  p_discount_value NUMERIC DEFAULT NULL,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_created_by UUID
)
RETURNS JSONB AS $$
DECLARE
  v_campaign_id UUID;
  v_creator_role TEXT;
  v_status TEXT;
BEGIN
  -- Get creator's role
  SELECT role INTO v_creator_role
  FROM user_roles
  WHERE user_id = p_created_by;
  
  -- Validate permissions
  IF v_creator_role = 'super_admin' THEN
    -- Super admin can create any type, auto-approved
    v_status := 'approved';
  ELSIF v_creator_role = 'admin' THEN
    -- Admin can create segmented and individual
    IF p_campaign_type = 'global' THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Admins cannot create global campaigns'
      );
    END IF;
    
    -- Segmented campaigns need approval
    IF p_campaign_type = 'segmented' THEN
      v_status := 'pending_approval';
    ELSE
      v_status := 'approved';
    END IF;
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient permissions to create campaigns'
    );
  END IF;
  
  -- Validate dates
  IF p_start_date >= p_end_date THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'End date must be after start date'
    );
  END IF;
  
  -- Create campaign
  INSERT INTO campaigns (
    title,
    description,
    campaign_type,
    target_audience,
    target_user_ids,
    discount_type,
    discount_value,
    start_date,
    end_date,
    status,
    created_by,
    approved_by,
    approved_at
  ) VALUES (
    p_title,
    p_description,
    p_campaign_type,
    p_target_audience,
    p_target_user_ids,
    p_discount_type,
    p_discount_value,
    p_start_date,
    p_end_date,
    v_status,
    p_created_by,
    CASE WHEN v_status = 'approved' THEN p_created_by ELSE NULL END,
    CASE WHEN v_status = 'approved' THEN NOW() ELSE NULL END
  )
  RETURNING id INTO v_campaign_id;
  
  -- If needs approval, notify super admins
  IF v_status = 'pending_approval' THEN
    PERFORM notify_super_admins(
      'Campaign Approval Required',
      format('Admin %s created a campaign that requires approval: %s', p_created_by, p_title),
      'campaign_approval',
      jsonb_build_object(
        'campaign_id', v_campaign_id,
        'created_by', p_created_by,
        'campaign_type', p_campaign_type
      ),
      'high'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'campaign_id', v_campaign_id,
    'status', v_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### `approve_campaign()`

```sql
CREATE OR REPLACE FUNCTION approve_campaign(
  p_campaign_id UUID,
  p_approved_by UUID
)
RETURNS JSONB AS $$
DECLARE
  v_campaign RECORD;
BEGIN
  -- Verify approver is super_admin
  IF NOT is_super_admin(p_approved_by) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only super admins can approve campaigns'
    );
  END IF;
  
  -- Get campaign
  SELECT * INTO v_campaign
  FROM campaigns
  WHERE id = p_campaign_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Campaign not found'
    );
  END IF;
  
  IF v_campaign.status != 'pending_approval' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Campaign is not pending approval'
    );
  END IF;
  
  -- Approve campaign
  UPDATE campaigns
  SET 
    status = 'approved',
    approved_by = p_approved_by,
    approved_at = NOW()
  WHERE id = p_campaign_id;
  
  -- Notify creator
  PERFORM create_notification(
    v_campaign.created_by,
    'campaign',
    'campaign_approved',
    'Campaign Approved',
    format('Your campaign "%s" has been approved and is ready to activate.', v_campaign.title),
    'medium',
    format('/campaigns/%s', p_campaign_id),
    jsonb_build_object('campaign_id', p_campaign_id)
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'campaign_id', p_campaign_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### `reject_campaign()`

```sql
CREATE OR REPLACE FUNCTION reject_campaign(
  p_campaign_id UUID,
  p_rejected_by UUID,
  p_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_campaign RECORD;
BEGIN
  -- Verify rejector is super_admin
  IF NOT is_super_admin(p_rejected_by) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only super admins can reject campaigns'
    );
  END IF;
  
  -- Get campaign
  SELECT * INTO v_campaign
  FROM campaigns
  WHERE id = p_campaign_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Campaign not found'
    );
  END IF;
  
  -- Reject campaign
  UPDATE campaigns
  SET 
    status = 'cancelled',
    rejection_reason = p_reason,
    updated_at = NOW()
  WHERE id = p_campaign_id;
  
  -- Notify creator
  PERFORM create_notification(
    v_campaign.created_by,
    'campaign',
    'campaign_rejected',
    'Campaign Rejected',
    format('Your campaign "%s" was rejected. Reason: %s', v_campaign.title, p_reason),
    'high',
    format('/campaigns/%s', p_campaign_id),
    jsonb_build_object('campaign_id', p_campaign_id, 'reason', p_reason)
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'campaign_id', p_campaign_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### `activate_campaign()`

```sql
CREATE OR REPLACE FUNCTION activate_campaign(p_campaign_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_campaign RECORD;
  v_target_users UUID[];
  v_user_id UUID;
  v_notification_count INTEGER := 0;
BEGIN
  -- Get campaign
  SELECT * INTO v_campaign
  FROM campaigns
  WHERE id = p_campaign_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Campaign not found'
    );
  END IF;
  
  IF v_campaign.status != 'approved' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Campaign must be approved before activation'
    );
  END IF;
  
  IF v_campaign.start_date > NOW() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Campaign start date is in the future'
    );
  END IF;
  
  -- Update status
  UPDATE campaigns
  SET status = 'active'
  WHERE id = p_campaign_id;
  
  -- Get target users
  IF v_campaign.target_audience = 'all' THEN
    SELECT ARRAY_AGG(user_id) INTO v_target_users
    FROM user_roles
    WHERE role IN ('provider', 'client');
  ELSIF v_campaign.target_audience = 'providers' THEN
    SELECT ARRAY_AGG(user_id) INTO v_target_users
    FROM user_roles
    WHERE role = 'provider';
  ELSIF v_campaign.target_audience = 'clients' THEN
    SELECT ARRAY_AGG(user_id) INTO v_target_users
    FROM user_roles
    WHERE role = 'client';
  ELSIF v_campaign.target_audience = 'specific' THEN
    v_target_users := v_campaign.target_user_ids;
  END IF;
  
  -- Send notifications to all target users
  FOREACH v_user_id IN ARRAY v_target_users
  LOOP
    DECLARE
      v_notification_id UUID;
    BEGIN
      -- Create notification
      v_notification_id := create_notification(
        v_user_id,
        'promo',
        'campaign',
        v_campaign.title,
        v_campaign.description,
        'medium',
        format('/campaigns/%s', p_campaign_id),
        jsonb_build_object(
          'campaign_id', p_campaign_id,
          'discount_type', v_campaign.discount_type,
          'discount_value', v_campaign.discount_value
        )
      );
      
      -- Log campaign notification
      IF v_notification_id IS NOT NULL THEN
        INSERT INTO campaign_notifications (
          campaign_id,
          user_id,
          notification_id
        ) VALUES (
          p_campaign_id,
          v_user_id,
          v_notification_id
        );
        
        v_notification_count := v_notification_count + 1;
      END IF;
    END;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'campaign_id', p_campaign_id,
    'notifications_sent', v_notification_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### `validate_campaign_code()`

```sql
CREATE OR REPLACE FUNCTION validate_campaign_code(
  p_code TEXT,
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_campaign RECORD;
  v_usage_count INTEGER;
BEGIN
  -- Find campaign by code
  SELECT * INTO v_campaign
  FROM campaigns
  WHERE discount_code = p_code
    AND status = 'active'
    AND start_date <= NOW()
    AND end_date >= NOW();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Invalid or expired campaign code'
    );
  END IF;
  
  -- Check if user is in target audience
  IF v_campaign.target_audience = 'providers' AND NOT is_provider(p_user_id) THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'This campaign is only for providers'
    );
  END IF;
  
  IF v_campaign.target_audience = 'clients' AND NOT is_client(p_user_id) THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'This campaign is only for clients'
    );
  END IF;
  
  IF v_campaign.target_audience = 'specific' AND NOT (p_user_id = ANY(v_campaign.target_user_ids)) THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'This campaign is not available for you'
    );
  END IF;
  
  -- Check max uses
  IF v_campaign.max_uses IS NOT NULL THEN
    SELECT COUNT(*) INTO v_usage_count
    FROM campaign_usage
    WHERE campaign_id = v_campaign.id;
    
    IF v_usage_count >= v_campaign.max_uses THEN
      RETURN jsonb_build_object(
        'valid', false,
        'error', 'Campaign has reached maximum uses'
      );
    END IF;
  END IF;
  
  -- Check max uses per user
  SELECT COUNT(*) INTO v_usage_count
  FROM campaign_usage
  WHERE campaign_id = v_campaign.id
    AND user_id = p_user_id;
  
  IF v_usage_count >= v_campaign.max_uses_per_user THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'You have already used this campaign'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'valid', true,
    'campaign_id', v_campaign.id,
    'discount_type', v_campaign.discount_type,
    'discount_value', v_campaign.discount_value,
    'title', v_campaign.title
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Campaign Workflow

### 1. Creation Flow

```
Admin/Super Admin creates campaign
    ↓
System validates permissions
    ↓
Campaign type = global? → Yes → Requires approval (unless super_admin)
    ↓ No
Campaign type = segmented? → Yes → Requires approval
    ↓ No
Campaign type = individual → Auto-approved
    ↓
Campaign saved with appropriate status
    ↓
If pending approval → Notify super_admins
```

### 2. Approval Flow

```
Super Admin reviews campaign
    ↓
Approve or Reject?
    ↓
Approve → Update status to 'approved'
    ↓
Notify creator
    ↓
Creator can activate campaign
```

### 3. Activation Flow

```
Creator activates approved campaign
    ↓
System validates start date
    ↓
Determine target users based on audience
    ↓
Create notifications for all target users
    ↓
Log campaign notifications
    ↓
Campaign status = 'active'
    ↓
Users receive notifications
```

### 4. Usage Flow

```
User applies campaign code at checkout
    ↓
System validates code
    ↓
Check eligibility (audience, max uses, etc.)
    ↓
Apply discount
    ↓
Log campaign usage
    ↓
Update analytics
```

## UI Pages

### 1. Campaign List (`/campaigns`)

**Features:**
- Table of all campaigns
- Filter by status, type, audience
- Search by title
- Quick actions: View, Edit, Activate, Pause
- Status badges
- Approval indicators

**Permissions:**
- Super admin: View all
- Admin: View own campaigns
- Support: No access

### 2. Create Campaign (`/campaigns/new`)

**Form Fields:**
- Title (required)
- Description
- Campaign type (dropdown)
- Target audience (dropdown)
- Target users (multi-select, if individual)
- Discount type (percentage/fixed/free)
- Discount value
- Discount code (optional, auto-generated)
- Max uses (optional)
- Max uses per user
- Start date (required)
- End date (required)
- Banner image (upload)
- Thumbnail image (upload)

**Validation:**
- End date > Start date
- Discount value > 0
- Target users required if individual campaign
- Permission check based on campaign type

### 3. Campaign Detail (`/campaigns/[id]`)

**Sections:**
- Campaign information
- Status and approval info
- Target audience details
- Discount details
- Schedule
- Analytics (if active)
- Notification log
- Usage log

**Actions:**
- Edit (if draft/pending)
- Approve/Reject (super_admin only)
- Activate (if approved)
- Pause (if active)
- Cancel
- Duplicate

### 4. Campaign Approval Queue (`/campaigns/pending`)

**Super Admin Only**

**Features:**
- List of campaigns pending approval
- Campaign details preview
- Approve/Reject buttons
- Rejection reason form
- Bulk actions

### 5. Campaign Analytics (`/campaigns/[id]/analytics`)

**Metrics:**
- Notifications sent
- Open rate
- Click rate
- Conversion rate
- Total discount given
- Revenue generated
- Usage by date (chart)
- Top users (table)

**Filters:**
- Date range
- User segment

## Implementation Checklist

### Database
- [ ] Create `campaigns` table
- [ ] Create `campaign_notifications` table
- [ ] Create `campaign_usage` table
- [ ] Create `campaign_analytics` table
- [ ] Create campaign functions
- [ ] Add RLS policies
- [ ] Create indexes

### Server Actions
- [ ] `createCampaign()` - Create campaign
- [ ] `updateCampaign()` - Update campaign
- [ ] `deleteCampaign()` - Delete campaign
- [ ] `approveCampaign()` - Approve (super_admin)
- [ ] `rejectCampaign()` - Reject (super_admin)
- [ ] `activateCampaign()` - Activate campaign
- [ ] `pauseCampaign()` - Pause campaign
- [ ] `getCampaigns()` - Get campaign list
- [ ] `getCampaignDetail()` - Get campaign details
- [ ] `validateCampaignCode()` - Validate code
- [ ] `applyCampaign()` - Apply campaign to booking
- [ ] `getCampaignAnalytics()` - Get analytics

### Components
- [ ] CampaignTable - Campaign list
- [ ] CampaignForm - Create/edit form
- [ ] CampaignCard - Campaign display card
- [ ] CampaignStatusBadge - Status indicator
- [ ] CampaignApprovalCard - Approval interface
- [ ] CampaignAnalytics - Analytics dashboard
- [ ] TargetAudienceSelector - Audience selection
- [ ] DiscountConfigurator - Discount setup

### Pages
- [ ] `/campaigns` - Campaign list
- [ ] `/campaigns/new` - Create campaign
- [ ] `/campaigns/[id]` - Campaign detail
- [ ] `/campaigns/[id]/edit` - Edit campaign
- [ ] `/campaigns/[id]/analytics` - Analytics
- [ ] `/campaigns/pending` - Approval queue (super_admin)

### Testing
- [ ] Test campaign creation
- [ ] Test approval workflow
- [ ] Test activation and notification
- [ ] Test code validation
- [ ] Test usage tracking
- [ ] Test analytics calculation

## Automated Tasks

### Daily Cron Jobs

1. **Activate Scheduled Campaigns**
   - Check for approved campaigns with start_date = today
   - Activate and send notifications

2. **Expire Campaigns**
   - Check for active campaigns with end_date < today
   - Update status to 'expired'

3. **Calculate Analytics**
   - Aggregate daily metrics for each active campaign
   - Store in `campaign_analytics` table

### Implementation

```typescript
// src/app/api/cron/campaigns/route.ts
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Activate scheduled campaigns
  await activateScheduledCampaigns();
  
  // Expire old campaigns
  await expireOldCampaigns();
  
  // Calculate analytics
  await calculateDailyAnalytics();
  
  return Response.json({ success: true });
}
```

## Security Considerations

1. **Permission Validation:** Always validate on server-side
2. **Code Uniqueness:** Ensure discount codes are unique
3. **Usage Limits:** Enforce max uses per user
4. **Date Validation:** Prevent backdating campaigns
5. **Approval Required:** Global campaigns must be approved
6. **Audit Logging:** Log all campaign actions

## Next Steps

After Phase 2C completion:
- Phase 3 - Advanced analytics and reporting
- Phase 4 - A/B testing for campaigns
- Phase 5 - Campaign templates
- Phase 6 - Automated campaign triggers

## References

- [Stripe Promotions](https://stripe.com/docs/billing/subscriptions/coupons)
- [Campaign Management Best Practices](https://www.campaignmonitor.com/resources/)
- [PostgreSQL Date/Time Functions](https://www.postgresql.org/docs/current/functions-datetime.html)
