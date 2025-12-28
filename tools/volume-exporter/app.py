#!/usr/bin/env python3
"""
Simple Prometheus exporter that reports Docker volume sizes (under /var/lib/docker/volumes)
Expose metrics:
 - docker_volume_size_bytes{volume="<name>"}
 - docker_volume_count (number of volumes)
 - docker_volumes_total_bytes (sum)
 - host_fs_total_bytes, host_fs_free_bytes for filesystem containing /var/lib/docker/volumes

Prometheus should scrape this exporter and Grafana can visualize metrics and set alerts.
"""
import os
import time
import argparse
import logging
from prometheus_client import start_http_server, Gauge
import shutil

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('volume-exporter')

VOLUME_DIR = '/var/lib/docker/volumes'

g_volume_size = Gauge('docker_volume_size_bytes', 'Size of docker volume (bytes)', ['volume'])
g_volume_count = Gauge('docker_volume_count', 'Number of docker volumes')
g_volumes_total = Gauge('docker_volumes_total_bytes', 'Total bytes used by all docker volumes')

g_fs_total = Gauge('host_fs_total_bytes', 'Host filesystem total bytes', ['mount'])
g_fs_free = Gauge('host_fs_free_bytes', 'Host filesystem free bytes', ['mount'])


def human(n):
    for unit in ['B','KB','MB','GB','TB']:
        if n < 1024.0:
            return f"{n:.2f}{unit}"
        n /= 1024.0
    return f"{n:.2f}PB"


def volume_dirs(path):
    if not os.path.isdir(path):
        return []
    try:
        return [d for d in os.listdir(path) if os.path.isdir(os.path.join(path, d))]
    except Exception:
        return []


def dir_size(path):
    total = 0
    for root, dirs, files in os.walk(path):
        for f in files:
            fp = os.path.join(root, f)
            try:
                total += os.path.getsize(fp)
            except Exception:
                pass
    return total


def update_metrics(volume_dir):
    vols = volume_dirs(volume_dir)
    g_volume_count.set(len(vols))
    total = 0
    for v in vols:
        path = os.path.join(volume_dir, v, '_data')
        if not os.path.exists(path):
            # some volumes may not have _data yet
            size = 0
        else:
            size = dir_size(path)
        total += size
        g_volume_size.labels(volume=v).set(size)
    g_volumes_total.set(total)

    # filesystem stats for mount containing volume_dir
    try:
        st = shutil.disk_usage(volume_dir)
        mount = volume_dir
        g_fs_total.labels(mount=mount).set(st.total)
        g_fs_free.labels(mount=mount).set(st.free)
    except Exception:
        logger.exception('failed to statvfs')

    logger.info('volumes=%d total=%s', len(vols), human(total))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=9101)
    parser.add_argument('--path', default=os.environ.get('DOCKER_VOLUMES_PATH', VOLUME_DIR))
    parser.add_argument('--interval', type=int, default=30)
    args = parser.parse_args()

    start_http_server(args.port)
    logger.info('Starting exporter on port %d, scanning %s every %ds', args.port, args.path, args.interval)
    while True:
        try:
            update_metrics(args.path)
        except Exception:
            logger.exception('update failed')
        time.sleep(args.interval)


if __name__ == '__main__':
    main()
