// src/app/services/project.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap, filter, catchError } from 'rxjs/operators';
import { Project } from '../models/project.model';
import { Simulation } from '../models/simulation.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = ''; //http://192.168.239.1:3000/project

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
  ) {
    this.configService.loadConfig().subscribe((config) => {
      this.apiUrl = `http://${config.serverIp}:${config.serverPort}/project`;
    });
  }
  //from project controller
  getProjectsByUserId(userId: number): Observable<Project[]> {
    return this.configService.loadConfig().pipe(
      switchMap((config) => {
        const apiUrl = `http://${config.serverIp}:${config.serverPort}/project`;
        return this.http.get<any[]>(`${apiUrl}/user/${userId}`);
      }),
      map((response) =>
        response.map((project) => ({
          name: project.projectName,
          id: project.projectId,
          date: new Date(project.lastEditTime).toLocaleString(),
          expanded: false,
          simulations: [] as Simulation[],
        })),
      ),
    );
  }
  addProject(userId: number, projectName: string): Observable<any> {
    return this.configService.loadConfig().pipe(
      switchMap((config) => {
        const apiUrl = `http://${config.serverIp}:${config.serverPort}/project`;
        return this.http.post<any>(apiUrl, { userId, projectName });
      }),
    );
  }
  deleteProject(projectId: number): Observable<any> {
    return this.configService.loadConfig().pipe(
      switchMap((config) => {
        const apiUrl = `http://${config.serverIp}:${config.serverPort}/project`;
        return this.http.delete<any>(`${apiUrl}/delete/${projectId}`);
      }),
    );
  }

  searchProjects(userId: number, query: string): Observable<Project[]> {
    return this.configService.loadConfig().pipe(
      switchMap((config) => {
        const apiUrl = `http://${config.serverIp}:${config.serverPort}/project/search/user/${userId}`;
        return this.http.get<any[]>(`${apiUrl}?query=${query}`);
      }),
      map((response) =>
        response.map((project) => ({
          name: project.projectName,
          id: project.projectId,
          date: new Date(project.lastEditTime).toLocaleString(),
          expanded: false,
          simulations: [] as Simulation[],
        })),
      ),
    );
  }

  //from project REPORT controller
  getReportsByProjectId(projectId: number): Observable<Simulation[]> {
    return this.configService.loadConfig().pipe(
      switchMap((config) => {
        const apiUrl = `http://${config.serverIp}:${config.serverPort}/project`;
        return this.http.get<any[]>(`${apiUrl}/report/${projectId}`);
      }),
      map((response) =>
        response.map((report) => ({
          name: report.reportName,
          id: report.reportId,
          date: new Date(report.simuTime).toLocaleString(), // moment.js
        })),
      ),
    );
  }
  //get recent report is in message service :)

  //from project GROUND STATION controller
  getGroundStationsByProjectId(
    projectId: number,
    type: number,
  ): Observable<any> {
    return this.configService.loadConfig().pipe(
      switchMap((config) => {
        const apiUrl = `http://${config.serverIp}:${config.serverPort}/project`;
        return this.http.get<any>(
          `${apiUrl}/groundStations/${projectId}/${type}`,
        );
      }),
    );
  }

  getFormattedGroundStations(projectId: number): Observable<any> {
    return forkJoin({
      ut: this.getGroundStationsByProjectId(projectId, 0),
      ft: this.getGroundStationsByProjectId(projectId, 1),
    }).pipe(
      map(({ ut, ft }) => {
        const formatGroundStations = (stations: any[]) => ({
          type: 'FeatureCollection',
          features: stations.map((station) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [
                station.longitude,
                station.latitude,
                station.altitude,
              ],
            },
            properties: {
              gsId: station.gsId,
              cellId: station.cellId,
              connectedSatId: station.connectedSatId,
              acceptElevation: station.acceptElevation,
            },
          })),
        });

        return {
          ut: formatGroundStations(ut),
          ft: formatGroundStations(ft),
        };
      }),
    );
  }

  updateGroundStation(
    gsId: number,
    type: number,
    groundStationData: any,
  ): Observable<any> {
    return this.configService.loadConfig().pipe(
      switchMap((config) => {
        const apiUrl = `http://${config.serverIp}:${config.serverPort}/project`;
        return this.http.put<any>(
          `${apiUrl}/groundStation/${gsId}/${type}`,
          groundStationData,
        );
      }),
    );
  }
  insertGroundStation(
    projectId: number,
    longitude: number,
    latitude: number,
    type: number,
  ): Observable<any> {
    return this.configService.loadConfig().pipe(
      switchMap((config) => {
        const apiUrl = `http://${config.serverIp}:${config.serverPort}/project`;
        const groundStationData = { projectId, longitude, latitude, type };
        return this.http.post<any>(
          `${apiUrl}/groundStation`,
          groundStationData,
        );
      }),
    );
  }

  //from project CONSTELLATION controller
  getPlanesByProjectId(projectId: number): Observable<any> {
    return this.configService.loadConfig().pipe(
      switchMap((config) => {
        const apiUrl = `http://${config.serverIp}:${config.serverPort}/project`;
        return this.http.get<any>(`${apiUrl}/planes/${projectId}`);
      }),
    );
  }

  getSatellitesByProjectId(projectId: number): Observable<any> {
    return this.configService.loadConfig().pipe(
      switchMap((config) => {
        const apiUrl = `http://${config.serverIp}:${config.serverPort}/project`;
        return this.http.get<any>(`${apiUrl}/satellites/${projectId}`);
      }),
    );
  }

  getIslByProjectId(projectId: number): Observable<any> {
    return this.configService.loadConfig().pipe(
      switchMap((config) => {
        const apiUrl = `http://${config.serverIp}:${config.serverPort}/project`;
        return this.http.get<any>(`${apiUrl}/isls/${projectId}`);
      }),
    );
  }

  getCplByProjectId(projectId: number): Observable<any> {
    return this.configService.loadConfig().pipe(
      switchMap((config) => {
        const apiUrl = `http://${config.serverIp}:${config.serverPort}/project`;
        return this.http.get<any>(`${apiUrl}/cpls/${projectId}`);
      }),
    );
  }
  getFormattedSatellites(projectId: number): Observable<any> {
    return this.getSatellitesByProjectId(projectId).pipe(
      map((satellites) => {
        const formatSatellites = (satellites: any[]) => ({
          type: 'FeatureCollection',
          features: satellites.map((satellite) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [
                satellite.longitude,
                satellite.latitude,
                satellite.altitude,
              ],
            },
            properties: {
              satelliteId: satellite.satelliteId,
              planeId: satellite.planeId,
              satName: satellite.satName,
              latitude: satellite.latitude,
              longitude: satellite.longitude,
              altitude: satellite.altitude,
            },
          })),
        });
  
        return formatSatellites(satellites);
      })
    );
  }
  

  //from project SIMU CONF controller
  getSimuSettingsByProjectId(projectId: number): Observable<any> {
    return this.configService.loadConfig().pipe(
      switchMap((config) => {
        const apiUrl = `http://${config.serverIp}:${config.serverPort}/project`;
        return this.http.get<any>(`${apiUrl}/simuSettings/${projectId}`);
      }),
    );
  }

  getSimuItemsByProjectId(projectId: number): Observable<any> {
    return this.configService.loadConfig().pipe(
      switchMap((config) => {
        const apiUrl = `http://${config.serverIp}:${config.serverPort}/project`;
        return this.http.get<any>(`${apiUrl}/simuItems/${projectId}`);
      }),
    );
  }

  updateSimuSettingsByProjectId(
    projectId: number,
    simuSettings: any,
  ): Observable<any> {
    return this.configService.loadConfig().pipe(
      switchMap((config) => {
        const apiUrl = `http://${config.serverIp}:${config.serverPort}/project`;
        return this.http.put<any>(`${apiUrl}/simuSettings/${projectId}`, {
          simuSettings,
        });
      }),
    );
  }

  updateSimuItemsByProjectId(
    projectId: number,
    simuItems: any,
  ): Observable<any> {
    return this.configService.loadConfig().pipe(
      switchMap((config) => {
        const apiUrl = `http://${config.serverIp}:${config.serverPort}/project`;
        return this.http.put<any>(`${apiUrl}/simuItems/${projectId}`, {
          simuItems,
        });
      }),
    );
  }

  initializeSimulationConf(projectId: number): Observable<any> {
    return this.configService.loadConfig().pipe(
      switchMap((config) => {
        const apiUrl = `http://${config.serverIp}:${config.serverPort}/project`;
        return this.http.post<any>(
          `${apiUrl}/initializeSimulationConf/${projectId}`,
          {
            projectId,
          },
        );
      }),
    );
  }
}
