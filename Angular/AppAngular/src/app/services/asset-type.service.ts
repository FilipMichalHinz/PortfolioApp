import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AssetType } from '../model/asset-type';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AssetTypeService {
  baseUrl: string = 'http://localhost:5215/api';

  constructor(private http: HttpClient) {}

  getAssetTypes(): Observable<AssetType[]> {
    return this.http.get<AssetType[]>(`${this.baseUrl}/assettype`);
  }
}
