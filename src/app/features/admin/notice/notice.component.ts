import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NoticeService } from '../../../core/services/notice.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-notice',
  imports: [CommonModule, FormsModule],
  templateUrl: './notice.component.html'
})
export class NoticeComponent implements OnInit {

  @ViewChild('fileInput') fileInput!: ElementRef;

  notices: any[] = [];
  loading = false; // ✅ keep only once

  content = '';
  file: File | null = null;
  fileUrl: string | null = null; // ✅ FIX ADDED
  filePreviewUrl: SafeResourceUrl | null = null;

  showPreview: boolean = false;
  editId: number | null = null;

  xmlData = '';
  showXml = false;
  parsedNotices: any[] = [];

  constructor(
    private noticeService: NoticeService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
    private router: Router
  ) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit(): void {
    this.load();
  this.showXml = false; // ✅ always closed on refresh
  }

  // 🔥 LOAD NORMAL DATA
  load(): void {
    this.loading = true;

    this.noticeService.getAll().subscribe({
      next: (res: any[]) => {
        this.notices = [...res];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // 🔥 XML LOAD
  loadXml(): void {
    this.noticeService.getXml().subscribe({
      next: (res: string) => {
        this.xmlData = res;
        this.showXml = true;
        this.parseXml(res);
      },
      error: (err: any) => { // ✅ FIX
        console.error('XML Load Error:', err);
      }
    });
  }

  // 🔥 XML PARSE
  parseXml(xml: string): void {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');

    const nodes = xmlDoc.getElementsByTagName('content');

    const temp: any[] = [];

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];

      temp.push({
        content: n.getAttribute('content'),
        fileUrl: n.getAttribute('Link'),
        date: n.getAttribute('date_time')
      });
    }

    this.parsedNotices = temp.reverse();
    this.cdr.detectChanges();
  }

  // 🔥 SAVE (KEEP ONLY ONE FUNCTION)
saveNotice(): void {

  console.log("SAVE CLICKED", this.editId);

  if (!this.content.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Content required',
      text: 'Please enter notice content'
    });
    return;
  }

  const fd = new FormData();
  fd.append('Content', this.content);
  fd.append('IsHyperLink', 'true');
  fd.append('SelectLink', 'File_Link');

  // ✅ attach file only if selected
  if (this.file) {
    fd.append('File', this.file);
  }

  // ================= UPDATE =================
  if (this.editId) {

    console.log("CALLING UPDATE API");

    this.noticeService.update(this.editId, fd).subscribe({
      next: (res: any) => {

        console.log("UPDATE SUCCESS", res);

        // ✅ reset form
        this.content = '';
        this.file = null;
        this.editId = null;

        this.filePreviewUrl = null;
        this.showPreview = false;

        if (this.fileInput) {
          this.fileInput.nativeElement.value = '';
        }

        // ✅ refresh list
        this.notices = [];
        this.load();

        // ✅ SUCCESS TOAST (like delete)
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Updated successfully',
          showConfirmButton: false,
          timer: 2000
        });

      },
      error: (err: any) => {

        console.error("UPDATE ERROR", err);

        Swal.fire({
          icon: 'error',
          title: 'Update failed',
          text: 'Something went wrong'
        });
      }
    });

  } 
  
  // ================= ADD =================
  else {

    console.log("CALLING ADD API");

    if (!this.file) {
      Swal.fire({
        icon: 'warning',
        title: 'PDF required',
        text: 'Please upload a PDF file'
      });
      return;
    }

    this.noticeService.addNotice(fd).subscribe({
      next: (res: any) => {

        console.log("ADD SUCCESS", res);

        // ✅ reset form
        this.content = '';
        this.file = null;

        this.filePreviewUrl = null;
        this.showPreview = false;

        if (this.fileInput) {
          this.fileInput.nativeElement.value = '';
        }

        // ✅ refresh list
        this.notices = [];
        this.load();

        // ✅ SUCCESS TOAST
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Added successfully',
          showConfirmButton: false,
          timer: 2000
        });

      },
      error: (err: any) => {

        console.error("ADD ERROR", err);

        Swal.fire({
          icon: 'error',
          title: 'Add failed',
          text: 'Something went wrong'
        });
      }
    });
  }
}

// 🔥 CLOSE XML
closeXml(): void {
  this.showXml = false;
}


// 🔥 OPEN XML
openXml(): void {
  this.loadXml();
}


// 🔥 FILE SELECT
onFile(event: any): void {
  const selected = event.target.files[0];

  if (!selected) return;

  if (selected.type !== 'application/pdf') {
    alert('Only PDF files are allowed');
    return;
  }

  this.file = selected;

  // ✅ FIX: allow selecting same file again
  if (this.fileInput) {
    this.fileInput.nativeElement.value = '';
  }

  const url = URL.createObjectURL(selected);
  this.filePreviewUrl =
    this.sanitizer.bypassSecurityTrustResourceUrl(url);

  this.showPreview = false;
}
  // 🔥 REMOVE FILE
  removeFile(): void {
    this.file = null;
    this.filePreviewUrl = null;
    this.showPreview = false;

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  closePreview(): void {
    this.showPreview = false;
  }

  // 🔥 EDIT
  edit(n: any): void {
    this.editId = n.id;
    this.content = n.content;

    if (n.fileUrl) {
      const baseUrl = 'http://164.100.150.78/excise/backend';

      const fullUrl = n.fileUrl.startsWith('http')
        ? n.fileUrl
        : baseUrl + n.fileUrl;

      this.filePreviewUrl =
        this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
    }

    this.showPreview = false;
    this.file = null;

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // 🔥 DELETE
  delete(id: number): void {

    Swal.fire({
      title: 'Are you sure?',
      text: 'This notice will be deleted permanently!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {

      if (result.isConfirmed) {

        this.noticeService.delete(id).subscribe({
          next: () => {

            this.notices = this.notices.filter(n => n.id !== id);

            if (this.showXml) {
              this.loadXml();
            }

            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title: 'Deleted successfully',
              showConfirmButton: false,
              timer: 2000
            });

          },
          error: () => {

            this.notices = this.notices.filter(n => n.id !== id);

            if (this.showXml) {
              this.loadXml();
            }

            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title: 'Deleted successfully',
              showConfirmButton: false,
              timer: 2000
            });
          }
        });

      }

    });
  }

  // 🔥 OPEN PDF
  openPdf(url: string): void {
    if (!url) return;

    let fullUrl = url;

    // const baseUrl = 'http://164.100.150.78/excise/backend';
    const baseUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5115/excise/backend'
  : 'http://164.100.150.78/excise/backend';

    if (url.startsWith('http')) {
      fullUrl = url;
    } else {
      fullUrl = baseUrl + url;
    }

    window.open(fullUrl, '_blank');
  }

  resetForm(): void {
    this.content = '';
    this.file = null;
    this.filePreviewUrl = null;
    this.editId = null;
    this.showPreview = false;

    this.cdr.detectChanges();

    setTimeout(() => {
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
    }, 0);
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  downloadXml(): void {
    if (!this.xmlData) {
      alert('No XML data available');
      return;
    }

    const blob = new Blob([this.xmlData], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'notices.xml';
    a.click();

    window.URL.revokeObjectURL(url);
  }

  viewXml(): void {
    this.loadXml();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}