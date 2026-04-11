import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WindowsService {
  private readonly _openKeys = signal<string[]>([]);
  readonly openKeys = this._openKeys.asReadonly();

  open(key: string): void {
    if (this._openKeys().includes(key)) return;
    this._openKeys.update(keys => [...keys, key]);
  }

  close(key: string): void {
    this._openKeys.update(keys => keys.filter(k => k !== key));
  }
}
