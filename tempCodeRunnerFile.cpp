#include <iostream>
using namespace std;


int main(){
    int n;
    cout << "Enter no. of elemets in array: ";
    cin >> n;
    int arr[n];
    for(int i=0;i<n;i++){
        cin >> arr[i];
    }
    for(int i=0;i<n;i++){
        if(arr[i]%2==0){
            cout << arr[i] << endl;
        }else{
            cout << arr[i] << endl;
        }
    }
}