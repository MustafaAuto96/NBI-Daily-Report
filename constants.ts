import type { Site, ProblemReport } from './types';

export const DUMMY_SITES: Site[] = [
    {
        id: '1',
        siteLocationName: 'New York HQ',
        deviceName: 'NYC-RTR-01',
        sdwanSiteId: 'NYC-001',
        lanIp: '10.1.1.1',
        elInfo: { info: 'Verizon Fiber', capacity: '1 Gbps', l2Ip: '192.168.1.1' },
        ilevantInfo: { info: 'Comcast Business', capacity: '500 Mbps' },
        horizonInfo: { info: 'AT&T Fiber', capacity: '1 Gbps', l2Ip: '192.168.1.2' },
    },
    {
        id: '2',
        siteLocationName: 'London Office',
        deviceName: 'LDN-RTR-01',
        sdwanSiteId: 'LDN-002',
        lanIp: '10.2.1.1',
        elInfo: { info: 'BT Business', capacity: '500 Mbps', l2Ip: '10.2.2.1' },
        ilevantInfo: { info: 'Virgin Media', capacity: '300 Mbps' },
        horizonInfo: { info: 'TalkTalk Business', capacity: '500 Mbps', l2Ip: '10.2.2.2' },
    },
    {
        id: '3',
        siteLocationName: 'Tokyo Branch',
        deviceName: 'TKY-RTR-01',
        sdwanSiteId: 'TKY-003',
        lanIp: '10.3.1.1',
        elInfo: { info: 'NTT East', capacity: '2 Gbps', l2Ip: '172.16.0.1' },
        ilevantInfo: { info: 'SoftBank Hikari', capacity: '1 Gbps' },
        horizonInfo: { info: 'KDDI au Hikari', capacity: '2 Gbps', l2Ip: '172.16.0.2' },
    },
];

export const DUMMY_REPORTS: ProblemReport[] = [
    {
        id: '101',
        siteName: 'New York HQ',
        ticketId: 'TICK-5821',
        status: 'DOWN',
        reason: 'Network outage',
        lastUpdate: 'Router rebooted',
        issueDate: '2023-10-26',
        lastFollowUp: '2023-10-27',
    },
    {
        id: '102',
        siteName: 'London Office',
        ticketId: 'TICK-5822',
        status: 'UP',
        reason: 'Slow connectivity resolved',
        lastUpdate: 'ISP confirmed line stability',
        issueDate: '2023-10-25',
        lastFollowUp: '2023-10-27',
    }
];
