# 🔒 SSL Certificate Fix for Custom Domain

## Issue: NET::ERR_CERT_COMMON_NAME_INVALID

The custom domain `lafontaine.datasciencetech.ca` is showing an SSL certificate error. This is normal for new custom domains and can be fixed.

## ⚡ Immediate Fix Steps

### Step 1: Force SSL Certificate Refresh
1. Go to: https://github.com/Data-ScienceTech/LaFontaine-Pulse/settings/pages
2. **Remove the custom domain temporarily**:
   - Clear the "Custom domain" field
   - Click "Save"
3. **Wait 30 seconds**
4. **Re-add the custom domain**:
   - Enter: `lafontaine.datasciencetech.ca`
   - Click "Save"
5. **Check "Enforce HTTPS"** once the DNS check passes

### Step 2: Wait for Certificate Provisioning
- ⏱️ **Time needed**: 5-15 minutes
- 🔍 **Status**: GitHub will show "DNS check in progress" then "HTTPS certificate provisioned"

## 🌐 Alternative Access Methods

While waiting for SSL certificate:

### Option A: Use HTTP temporarily
Visit: `http://lafontaine.datasciencetech.ca` (without the 's')

### Option B: Use original GitHub Pages URL
Visit: `https://data-sciencetech.github.io/LaFontaine-Pulse/`

## 🔍 Verification Steps

1. **DNS Check**: Use https://whatsmydns.net to verify CNAME propagation
2. **SSL Status**: Check GitHub Pages settings for certificate status
3. **Browser Test**: Try incognito/private browsing mode

## ⏰ Expected Timeline

- **DNS Propagation**: Up to 24 hours (usually much faster)
- **SSL Certificate**: 5-15 minutes after GitHub detects valid DNS
- **Full HTTPS Access**: Once certificate is provisioned

## 🆘 If Still Not Working

If the certificate doesn't provision after 30 minutes:

1. **Check DNS Configuration**:
   - Verify CNAME record: `lafontaine` → `data-sciencetech.github.io`
   - Ensure no conflicting A records

2. **Contact GitHub Support**:
   - Sometimes manual intervention is needed for certificate provisioning

3. **Alternative: Use GitHub Pages URL**:
   - The app works perfectly at: https://data-sciencetech.github.io/LaFontaine-Pulse/

## 🎯 Final Result

Once the SSL certificate is provisioned, your app will be fully accessible at:
**https://lafontaine.datasciencetech.ca** ✅

This is a one-time setup issue that will resolve automatically!
