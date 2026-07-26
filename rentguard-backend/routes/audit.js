const express = require('express');
const crypto = require('crypto');
const prisma = require('../prisma');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

function calculateHash(leaseId, area, conditionNotes, imageUrl, previousHash) {
    const dataString = `${leaseId}-${area}-${conditionNotes}-${imageUrl || ''}-${previousHash}`;
    return crypto.createHash('sha256').update(dataString).digest('hex');
}

// 1. POST /api/audit/log - Create condition record
router.post('/log', authenticateToken, async (req, res) => {
    const { leaseId, area, conditionNotes, imageUrl } = req.body;

    if (!leaseId || !area || !conditionNotes) {
        return res.status(400).json({ error: 'Missing required fields: leaseId, area, conditionNotes.' });
    }

    try {
        const lease = await prisma.lease.findUnique({ where: { id: leaseId } });
        if (!lease) {
            return res.status(404).json({ error: 'Lease not found.' });
        }

        if (lease.landlordId !== req.user.id && lease.tenantId !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized: You are not a member of this lease.' });
        }

        const lastLog = await prisma.auditLog.findFirst({
            where: { leaseId },
            orderBy: { timestamp: 'desc' }
        });

        const previousHash = lastLog ? lastLog.currentHash : "GENESIS_BLOCK_HASH";
        const currentHash = calculateHash(leaseId, area, conditionNotes, imageUrl, previousHash);

        const newLog = await prisma.auditLog.create({
            data: {
                area,
                conditionNotes,
                imageUrl: imageUrl || null,
                currentHash,
                previousHash,
                leaseId,
                submittedById: req.user.id
            },
            include: {
                submittedBy: { select: { id: true, name: true, role: true } }
            }
        });

        res.status(201).json({
            message: 'Condition record locked into cryptographic ledger!',
            log: newLog
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. GET /api/audit/lease/:leaseId/verify - Run Deep Cryptographic Verification
router.get('/lease/:leaseId/verify', authenticateToken, async (req, res) => {
    const { leaseId } = req.params;

    try {
        const logs = await prisma.auditLog.findMany({
            where: { leaseId },
            orderBy: { timestamp: 'asc' }
        });

        if (logs.length === 0) {
            return res.json({
                status: 'EMPTY',
                message: 'No logs recorded yet for this lease.',
                isChainValid: true,
                totalRecordsAudited: 0
            });
        }

        let isChainValid = true;
        let tamperedLogId = null;
        let expectedPrevHash = "GENESIS_BLOCK_HASH";

        for (let log of logs) {
            if (log.previousHash !== expectedPrevHash) {
                isChainValid = false;
                tamperedLogId = log.id;
                break;
            }

            const recalculatedHash = calculateHash(
                log.leaseId,
                log.area,
                log.conditionNotes,
                log.imageUrl,
                log.previousHash
            );

            if (log.currentHash !== recalculatedHash) {
                isChainValid = false;
                tamperedLogId = log.id;
                break;
            }

            expectedPrevHash = log.currentHash;
        }

        res.json({
            status: isChainValid ? 'SECURE' : 'TAMPERED_ALERT',
            isChainValid,
            tamperedLogId,
            totalRecordsAudited: logs.length,
            message: isChainValid
                ? 'Cryptographic audit ledger integrity verified. Zero tamper events detected.'
                : 'CRITICAL ALERT: Data tampering or hash mismatch detected in lease audit chain!'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. GET /api/audit/lease/:leaseId/logs - Fetch all logs
router.get('/lease/:leaseId/logs', authenticateToken, async (req, res) => {
    try {
        const logs = await prisma.auditLog.findMany({
            where: { leaseId: req.params.leaseId },
            orderBy: { timestamp: 'desc' },
            include: {
                submittedBy: { select: { id: true, name: true, role: true } }
            }
        });

        res.json({ logs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;