const express = require('express');
const crypto = require('crypto');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();
const prisma = require('../prisma');

function generateInviteCode() {
    return crypto.randomBytes(3).toString('hex').toUpperCase(); // e.g., "B7E19A"
}

// LANDLORD ONLY: Create Lease Unit
router.post('/create', authenticateToken, authorizeRoles('LANDLORD'), async (req, res) => {
    const { propertyName } = req.body;

    if (!propertyName) {
        return res.status(400).json({ error: 'Property name is required.' });
    }

    try {
        const inviteCode = generateInviteCode();
        const lease = await prisma.lease.create({
            data: {
                propertyName,
                inviteCode,
                landlordId: req.user.id
            }
        });

        res.status(201).json({ message: 'Lease created!', lease });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// TENANT ONLY: Join Lease via Invite Code
router.post('/join', authenticateToken, authorizeRoles('TENANT'), async (req, res) => {
    const { inviteCode } = req.body;

    if (!inviteCode) {
        return res.status(400).json({ error: 'Invite code is required.' });
    }

    try {
        const lease = await prisma.lease.findUnique({
            where: { inviteCode: inviteCode.trim().toUpperCase() }
        });

        if (!lease) {
            return res.status(404).json({ error: 'Invalid invite code.' });
        }

        if (lease.tenantId) {
            return res.status(400).json({ error: 'Lease already has an assigned tenant.' });
        }

        const updatedLease = await prisma.lease.update({
            where: { id: lease.id },
            data: { tenantId: req.user.id }
        });

        res.json({ message: 'Successfully joined lease!', lease: updatedLease });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET user's active leases
router.get('/my-leases', authenticateToken, async (req, res) => {
    try {
        let leases;
        if (req.user.role === 'LANDLORD') {
            leases = await prisma.lease.findMany({
                where: { landlordId: req.user.id },
                include: { tenant: { select: { id: true, name: true, email: true } } }
            });
        } else {
            leases = await prisma.lease.findMany({
                where: { tenantId: req.user.id },
                include: { landlord: { select: { id: true, name: true, email: true } } }
            });
        }

        res.json({ leases });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;